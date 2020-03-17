const axios = require("axios"),
    schedule = require("node-schedule"),
    Telegraf = require("telegraf");

const ACCESS_TOKEN_TELEGRAM = "";
const CHAT_ID = "";

class Tracker {
    constructor(telegramBot) {
        this.telegramBot = telegramBot;

        this.country = {
            confirmed: 0,
            deaths: 0,
            recovered: 0
        };

        this.global = {
            confirmed: 0,
            deaths: 0,
            recovered: 0
        };
    }

    initialize = async () => {
        this.setDataAndNotify();

        schedule.scheduleJob("0 */1 * * *", () => {
            this.setDataAndNotify();
        });
    };

    getDataFromCountry = async country => {
        try {
            const result = await axios.get(
                `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest?iso2=${country}&onlyCountries=true`
            );

            return result.data;
        } catch (err) {
            throw new Error(`Error in fetch country ${country}`);
        }
    };

    getDataGlobal = async () => {
        try {
            const result = await axios.get(
                `https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/brief`
            );

            return result.data;
        } catch (err) {
            throw new Error("Error in fetch global");
        }
    };

    setDataAndNotify = async () => {
        const country = await this.getDataFromCountry("AR");
        const global = await this.getDataGlobal();

        if (
            this.country.confirmed != country[0].confirmed ||
            this.country.deaths != country[0].deaths ||
            this.country.recovered != country[0].recovered
        ) {
            this.country = {
                confirmed: country[0].confirmed,
                deaths: country[0].deaths,
                recovered: country[0].recovered
            };

            this.telegramBot.telegram.sendMessage(
                CHAT_ID,
                `🦠 | Country | Confirmed: ${this.country.confirmed}, Deaths: ${this.country.deaths}, Recovered: ${this.country.recovered}`
            );
        }

        if (
            this.global.confirmed != global.confirmed ||
            this.global.deaths != global.deaths ||
            this.global.recovered != global.recovered
        ) {
            this.global = {
                confirmed: global.confirmed,
                deaths: global.deaths,
                recovered: global.recovered
            };

            this.telegramBot.telegram.sendMessage(
                CHAT_ID,
                `🦠 | Global | Confirmed: ${this.global.confirmed}, Deaths: ${this.global.deaths}, Recovered: ${this.global.recovered}`
            );
        }
    };
}

const telegramBot = new Telegraf(ACCESS_TOKEN_TELEGRAM);

const tracker = new Tracker(telegramBot);
tracker.initialize();
