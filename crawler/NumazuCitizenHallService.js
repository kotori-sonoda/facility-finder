const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');
const dbPath = path.resolve(__dirname, '../facility.sqlite');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database(dbPath);
const utils = require('./Utils')();

const FACILITY_NAME = '沼津市民文化センター';
const PROPERTIES = [
    ['https://www.city.numazu.shizuoka.jp/cgi-bin/s_yoyaku/User_i04.cgi?ReqCode=Y-f02-1-10-54-61-4-1', '第1リハーサル室'],
    ['https://www.city.numazu.shizuoka.jp/cgi-bin/s_yoyaku/User_i04.cgi?ReqCode=Y-f02-1-10-55-61-4-1', '第2リハーサル室'],
];
const AVAILABLE_COLOR = '#66CCFF';
const TIME_FRAME = ['午前', '午後', '夜間'];

class NumazuCitizenHallService {
    async crawl() {
        let browser = null;
        let page = null;
        const results = [];

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            page = await browser.newPage();

            for (let property of PROPERTIES) {
                page.goto(property[0]);
                await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    
                const cal = await page.$('body > div > form > table:nth-child(4) > tbody > tr:nth-child(2) > td > table > tbody');
                const availableDays = await cal.$$('a');
    
                const urls = await utils.asyncMap(availableDays, async (v) => {
                    return await (await v.getProperty('href')).jsonValue();
                });
    
                for (let url of urls) {
                    page.goto(url);
                    await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    
                    let dateParts = await page.evaluate(() => {
                        let y = parseInt(document.querySelector('select[name="yyyy"]').value, 10);
                        let m = parseInt(document.querySelector('select[name="mm"]').value, 10) - 1;
                        let d = parseInt(document.querySelector('select[name="dd"]').value, 10);
                        return Promise.resolve([y, m, d]);
                    });
                    let date = moment(dateParts);
    
                    let timeTable = await page.$('body > div > form > table:nth-child(4) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)');
    
                    let colors = await timeTable.$$eval('td', (e) => {
                        return e.map((v) => {return v.getAttribute('bgcolor')});
                    });
    
                    colors.forEach((v, i, a) => {
                        if (v === AVAILABLE_COLOR) {
                            results.push([FACILITY_NAME, property[1], date.format('YYYY/MM/DD'), TIME_FRAME[i]]);
                        }
                    });
    
                    await page.waitFor(5000);
                }
            };
            
            await page.close();
            await browser.close();

            db.serialize(() => {
                db.run('create table if not exists facility_statuses (name text, property text, date text, frame text)');

                let stmt = db.prepare('delete from facility_statuses where name = ?');
                stmt.run([FACILITY_NAME]);
                stmt.finalize();

                stmt = db.prepare('insert into facility_statuses values (?, ?, ?, ?)');
                for (let result of results) {
                    stmt.run(result);
                }
                stmt.finalize();
            });
            db.close();
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
}

module.exports = NumazuCitizenHallService;
