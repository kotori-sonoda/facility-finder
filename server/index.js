const express = require('express');
const sqlite = require('sqlite3').verbose();

const app = express();

app.use('/api/', (() => {
    const router = express.Router();

    router.get('/statuses/list', (req, res) => {
        const db = new sqlite.Database('../facility.sqlite');
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

app.use(express.static('../client'));

app.listen(3000);