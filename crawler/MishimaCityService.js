const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');
const dbPath = path.resolve(__dirname, '../facility.sqlite');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database(dbPath);
const utils = require('./Utils')();

const FACILITIES = [
    {
        name: '三島市民文化会館',
        url: 'http://www.task-asp.net/cu/eg/ykr222062.task?CMD=Aki&S=%ef%bc%91%ef%bc%92',
        properties: ['リハーサル室']
    }
];
const TIME_FRAME = ['午前', '午後', '夜間'];

class MishimaCityService {
    async crawl() {
        let browser = null;
        let page = null;
        let results = [];

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            page = await browser.newPage();

            for (let facility of FACILITIES) {
                for (let property of facility.properties) {
                    page.goto(facility.url);
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

                    let links = await page.$x(`//a[contains(text(), '${property}')]`);
                    links[0].click();
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

                    results = results.concat(await this.crawlSingleMonth(browser, page, facility, property));

                    page.goto(facility.url);
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

                    links = await page.$x(`//a[contains(text(), '${property}')]`);
                    links[0].click();
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

                    page.click('#MonthlyAkiListCtrl_NextMonImgBtn');
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

                    results = results.concat(await this.crawlSingleMonth(browser, page, facility, property));
                }
            }

            await page.close();
            await browser.close();

            db.serialize(() => {
                db.run('create table if not exists facility_statuses (name text, property text, date text, frame text)');

                let stmt = db.prepare('delete from facility_statuses where name = ?');
                for (let facility of FACILITIES) {
                    stmt.run([facility.name]);
                }
                stmt.finalize();

                stmt = db.prepare('insert into facility_statuses values (?, ?, ?, ?)');
                for (let result of results) {
                    stmt.run(result);
                }
                stmt.finalize();
            });
        } catch (e) {
            console.error(e);
            if (page) {
                await page.close();
            }
            if (browser) {
                await browser.close();
            }
        }
    }

    async crawlSingleMonth(browser, page, facility, property) {
        const results = [];
        const cal = await page.$('.table-calendar');
        const availableDays = await cal.$$('a');

        for (let day of availableDays) {
            await day.click({button: 'middle'});
            await page.waitFor(2000);
            let pages = await browser.pages();
            let timePage = pages[2];
            await timePage.bringToFront();
            await timePage.waitForSelector('.table-timeselect');

            let dateLabel = await timePage.$('.label-datechange-currentdate');
            let dateLabelText = await (await dateLabel.getProperty('textContent')).jsonValue();
            dateLabelText = dateLabelText.trim();

            // quick hack
            if (dateLabelText.startsWith('平成30')) {
                dateLabelText = dateLabelText.replace('平成30', '2018');
            } else {
                // maybe 2019
                dateLabelText = dateLabelText.replace(/^.*年/, '2019年');
            }

            let y = parseInt(dateLabelText.slice(0, 4), 10);
            let m = parseInt(dateLabelText.slice(5, 7), 10) - 1;
            let d = parseInt(dateLabelText.slice(8, 10), 10);
            let dateParts = [y, m, d];
            let date = moment(dateParts);

            let timeTable = await timePage.$('.table-timeselect');
            let frames = await timeTable.$$('tr');
            for (let [index, frame] of frames.entries()) {
                if (index >= 3) {
                    break;
                }
                let cells = await frame.$$('td');
                let labels = await cells[1].$$('label');
                let labelText = await (await labels[1].getProperty('textContent')).jsonValue();

                if (labelText === '(空き)') {
                    results.push([facility.name, property, date.format('YYYY/MM/DD'), TIME_FRAME[index]]);
                }

                await timePage.waitFor(2000);
            }

            await timePage.close();
        }

        return results;
    }
}

module.exports = MishimaCityService;