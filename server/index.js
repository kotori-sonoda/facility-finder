const express = require('express');
const sqlite = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../facility.sqlite');

const app = express();

app.use(express.static('../client'));

app.use('/api/', (() => {
    const router = express.Router();

    router.get('/statuses/list', (req, res) => {
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
    return router;
})());

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.listen(3000);
