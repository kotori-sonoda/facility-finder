const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');
const dbPath = path.resolve(__dirname, '../facility.sqlite');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database(dbPath);
const utils = require('./Utils')();

const URL = 'https://www.cm1.epss.jp/izunokuni/w/';
const FACILITIES = [
    {
        name: '韮山時代劇場',
        properties: [
            'リハーサル室１',
            'リハーサル室２',
            '映像ホール'
        ]
    }
];
const TIME_FRAME = ['午前', '午後', '夜間'];

class IzunokuniCityService {
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
                    page.goto(URL);
                    await page.waitForNavigation({waitUntil: 'networkidle0'});
    
                    page.click('#disp > center > form > center:nth-child(6) > table > tbody > tr > th > a:nth-child(1)');
                    await page.waitForNavigation({waitUntil: 'networkidle0'});
    
                    page.click('#disp > center > form > table:nth-child(4) > tbody > tr:nth-child(2) > td > a');
                    await page.waitForNavigation({waitUntil: 'networkidle0'});
    
                    let facilityLinks = await page.$x(`//a[contains(text(), '${facility.name}')]`);
                    facilityLinks[0].click();
                    await page.waitForNavigation({waitUntil: 'networkidle0'});

                    let propertyLinks = await page.$x(`//a[contains(., '${property}')]`);
                    propertyLinks[0].click();
                    await page.waitForNavigation({waitUntil: 'networkidle0'});

                    results = results.concat(await this.crawlSingleMonth(browser, page, facility, property));

                    page.click('#disp > center > form > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > a:nth-child(3)');
                    await page.waitForNavigation({waitUntil: 'networkidle0'});

                    results = results.concat(await this.crawlSingleMonth(browser, page, facility, property));
                }

                await page.close();
                await browser.close();
            }

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
        let cal = await page.$('.m_akitablelist');
        let availableDays = await cal.$$('a');

        for (let i = 3; i < availableDays.length; i++) {
            availableDays[i].click();
            await page.waitForNavigation({waitUntil: 'networkidle0'});

            let weekly = await page.$('table.akitablelist');

            let headers = await weekly.$$('th.akitablelist');
            let yearCell = headers[0];
            let yearText = await (await yearCell.getProperty('textContent')).jsonValue();
            let y = parseInt(yearText.replace('年', ''), 10);
            let dateCell = headers[1];
            let dateText = await (await dateCell.getProperty('textContent')).jsonValue();

            let m = parseInt(dateText.match(/[0-9]{1,2}月/)[0].replace('月', ''), 10) - 1;
            let d = parseInt(dateText.match(/[0-9]{1,2}日/)[0].replace('日', ''), 10);
            let date = moment([y, m, d]);

            let rows = await weekly.$$('tr');
            for (let j = 1; j <= 3; j++) {
                let targetRow = rows[j];
                let targetCell = await targetRow.$('td');
                let img = await targetCell.$('img');
                let imgSrc = await (await img.getProperty('src')).jsonValue();
                if (imgSrc.indexOf('lw_emptybs') >= 0) {
                    results.push([facility.name, property, date.format('YYYY/MM/DD'), TIME_FRAME[j - 1]]);
                }
            }
            
            await page.waitFor(3000);

            page.click('#disp > center > form > table.head2 > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > a');
            await page.waitForNavigation({waitUntil: 'networkidle0'});
            cal = await page.$('.m_akitablelist');
            availableDays = await cal.$$('a');
        }

        return results;
    }
}

module.exports = IzunokuniCityService;