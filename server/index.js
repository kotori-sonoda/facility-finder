const express = require('express');
const sqlite = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../facility.sqlite');

const app = express();

app.use(express.static(path.join(__dirname + '/../client')));

app.use('/api/', (() => {
    const router = express.Router();

    router.get('/statuses/list/date', (req, res) => {
        const db = new sqlite.Database(dbPath);
        db.serialize(() => {
            db.all('select * from facility_statuses order by date asc', (err, rows) => {
                if (err) {
                    res.status(400);
                    res.json({message: 'にゃーん'});
                    return;
                }
                res.json({statuses: rows});
            });
        });
        db.close();
    });

    router.get('/statuses/list/facility', (req, res) => {
        const db = new sqlite.Database(dbPath);
        db.serialize(() => {
            db.all('select * from facility_statuses order by name asc', (err, rows) => {
                if (err) {
                    res.status(400);
                    res.json({message: 'にゃーん'});
                    return;
                }
                res.json({statuses: rows});
            });
        });
        db.close();
    });
    return router;
})());

app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/../client/index.html'));
});

app.listen(3000);
