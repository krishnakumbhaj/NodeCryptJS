import fs from 'fs';
import { CryptoHandler } from './cryptoHandler.js';

export class Storage {
    static FILE = `${process.cwd()}/.passwords/passwords.epm`;

    constructor(password) {
        this.PASSWORDS = {};
        this.VERIFIED_PASSWORD = password;
    }

    load() {
        const data = fs.readFileSync(Storage.FILE, 'utf8');
        const decryptedData = CryptoHandler.decrypt(data, this.VERIFIED_PASSWORD);
        this.PASSWORDS = decryptedData.passwords;
        this.VERIFIED_PASSWORD = decryptedData.verified_password;
    }

    save() {
        const encryptedData = CryptoHandler.encrypt({
            passwords: this.PASSWORDS,
            verified_password: this.VERIFIED_PASSWORD
        }, this.VERIFIED_PASSWORD);
        fs.writeFileSync(Storage.FILE, encryptedData);
    }
}
