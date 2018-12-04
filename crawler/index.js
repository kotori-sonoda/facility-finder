const NumazuCitizenHallService = require('./NumazuCitizenHallService');
const numazuCitizenHallService = new NumazuCitizenHallService();

(async () => {
    numazuCitizenHallService.crawl();
})();
