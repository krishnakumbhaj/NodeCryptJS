<!-- import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import inquirer from 'inquirer';
import clipboardy from 'clipboardy';

export async function PasswordManager() {
class CryptoHandler {
  static getCypher(password) {
    const key = crypto.createHash('sha256').update(password).digest().slice(0, 32);
    return crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
  }

  static getDecipher(password) {
    const key = crypto.createHash('sha256').update(password).digest().slice(0, 32);
    return crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
  }

  static encrypt(data, password) {
    const cipher = CryptoHandler.getCypher(password);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decrypt(encrypted, password) {
    const decipher = CryptoHandler.getDecipher(password);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}

class Storage {
  static FILE = path.join(process.cwd(), '.passwords', 'passwords.epm');

  constructor(password) {
    this.PASSWORDS = {};
    this.VERIFIED_PASSWORD = password;
  }

  load() {
    try {
      const data = fs.readFileSync(Storage.FILE, 'utf8');
      const decryptedData = CryptoHandler.decrypt(data, this.VERIFIED_PASSWORD);
      this.PASSWORDS = decryptedData.passwords;
      this.VERIFIED_PASSWORD = decryptedData.verified_password;
    } catch (error) {
      throw new Error('Failed to load or decrypt storage. Check your master password.');
    }
  }

  save() {
    try {
      fs.mkdirSync(path.dirname(Storage.FILE), { recursive: true });
      const encryptedData = CryptoHandler.encrypt({
        passwords: this.PASSWORDS,
        verified_password: this.VERIFIED_PASSWORD
      }, this.VERIFIED_PASSWORD);
      fs.writeFileSync(Storage.FILE, encryptedData, 'utf8');
    } catch (error) {
      throw new Error('Failed to save or encrypt storage.');
    }
  }
}

class PasswordGenerator {
  static generatePassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

class PasswordManager {
  constructor(name) {
    this.APP = name;
    this.storage = null;

    if (!fs.existsSync(Storage.FILE)) {
      this.initPm();
    } else {
      this.login();
    }
  }

  async initPm() {
    console.log('Welcome to the Password Manager');
    const { mpass, mconf } = await inquirer.prompt([
      { type: 'password', name: 'mpass', message: 'Set a Master Password' },
      { type: 'password', name: 'mconf', message: 'Confirm the Master Password' }
    ]);

    if (mpass === mconf) {
      this.storage = new Storage(mpass);
      this.storage.save();
      console.log('Master Password set successfully!');
      await this.mainMenu();
    } else {
      console.log('Passwords do not match. Try again.');
    //   await this.clearConsole();
    }
  }

  async login() {
    console.log('Welcome to the Password Manager');
  
    while (true) {
      const { password } = await inquirer.prompt([
        { type: 'password', name: 'password', message: 'Enter your Master Password' }
      ]);
  
      this.storage = new Storage(password);
  
      try {
        this.storage.load();
        if (password === this.storage.VERIFIED_PASSWORD) {
          console.log('Login successful!');
          this.mainMenu();
          return;
        } else {
          console.log('Invalid password! Please try again.');
        }
      } catch (error) {
        console.log('Invalid password! Please try again.');
      }
    }
  }
  

  async mainMenu() {
    while (true) {
    //   await this.clearConsole();
      console.log("Main Menu");
      const { option } = await inquirer.prompt([
        {
          type: 'list',
          name: 'option',
          message: 'Choose an option:',
          choices: [
            "Add Password",
            "Remove Password",
            "Edit Password",
            "List All",
            "Change Master Password",
            "Exit"
          ]
        }
      ]);

      switch (option) {
        case "Add Password":
          await this.addPassword();
          break;
        case "Remove Password":
          await this.removePassword();
          break;
        case "Edit Password":
          await this.editPassword();
          break;
        case "List All":
          await this.listAll();
          break;
        case "Change Master Password":
          await this.changeMasterPassword();
          break;
        case "Exit":
          console.log("Exiting the Password Manager. Goodbye!");
        //   await this.clearConsole();
          return;
      }
    }
  }

  async removePassword() {
    console.log("Remove Password");

    let site;
    while (true) {
        const { inputSite } = await inquirer.prompt([
            { type: 'input', name: 'inputSite', message: 'Enter the site/application name' }
        ]);

        site = inputSite;

        if (this.storage.PASSWORDS[site]) {
            break;
        } else {
            console.log(`No password found for ${site}. Please enter a valid site/application name.`);
        }
    }

    const { masterPassword } = await inquirer.prompt([
        { type: 'password', name: 'masterPassword', message: 'Enter the Master Password' }
    ]);

    if (masterPassword === this.storage.VERIFIED_PASSWORD) {
        delete this.storage.PASSWORDS[site];
        this.storage.save();
        console.log(`Password for ${site} has been removed successfully!`);
    } else {
        console.log("Incorrect Master Password! Password not removed.");
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: '\nPress Enter to return to the main menu' }
    ]);
    // await this.clearConsole();
}


  async addPassword() {
    console.log("Add Password");
    const { site } = await inquirer.prompt([
      { type: 'input', name: 'site', message: 'Enter the site/application name' }
    ]);

    if (this.storage.PASSWORDS[site]) {
      console.log(`Password for ${site} already exists!`);
    //   await this.clearConsole();
      return;
    }

    const { username } = await inquirer.prompt([
      { type: 'input', name: 'username', message: 'Enter the username' }
    ]);

    let password = null;
    while (!password) {
      const { newPassword, confirmPassword } = await inquirer.prompt([
        { type: 'password', name: 'newPassword', message: 'Enter the new password (press Enter to generate random)' },
        { type: 'password', name: 'confirmPassword', message: 'Confirm the password' }
      ]);
      if (!newPassword) {
        const { length } = await inquirer.prompt([
          { type: 'input', name: 'length', message: 'Enter the length of the password', default: 15, validate: input => !isNaN(input) }
        ]);
        password = PasswordGenerator.generatePassword(parseInt(length));
        console.log(`Generated password: ${password}`);
      } else if (newPassword === confirmPassword) {
        password = newPassword;
      } else {
        console.log("Passwords do not match. Try again.");
      }
    }

    this.storage.PASSWORDS[site] = { username, password };
    this.storage.save();
    console.log('Password added successfully!');
    clipboardy.writeSync(password); // Copy the actual password to clipboard
    console.log('Password has been copied to the clipboard!');
    await inquirer.prompt([
      { type: 'input', name: 'continue', message: '\nPress Enter to return to the main menu' }
    ]);
    // await this.clearConsole();
  }

  async editPassword() {
    console.log("Edit Password");

    let site;
    while (true) {
        const { inputSite } = await inquirer.prompt([
            { type: 'input', name: 'inputSite', message: 'Enter the site/application name' }
        ]);

        site = inputSite;

        if (this.storage.PASSWORDS[site]) {
            break;
        } else {
            console.log(`No password found for ${site}. Please enter a valid site/application name.`);
        }
    }

    let masterPassword;
    while (true) {
        const { inputMasterPassword } = await inquirer.prompt([
            { type: 'password', name: 'inputMasterPassword', message: 'Enter the Master Password' }
        ]);

        masterPassword = inputMasterPassword;

        if (masterPassword === this.storage.VERIFIED_PASSWORD) {
            break;
        } else {
            console.log("Incorrect Master Password! Please try again.");
        }
    }

    const { username } = await inquirer.prompt([
        { type: 'input', name: 'username', message: 'Enter the new username', default: this.storage.PASSWORDS[site].username }
    ]);

    let password = null;
    while (!password) {
        const { newPassword, confirmPassword } = await inquirer.prompt([
            { type: 'password', name: 'newPassword', message: 'Enter the new password (press Enter to generate random)' },
            { type: 'password', name: 'confirmPassword', message: 'Confirm the password' }
        ]);
        if (!newPassword) {
            const { length } = await inquirer.prompt([
                { type: 'input', name: 'length', message: 'Enter the length of the password', default: 15, validate: input => !isNaN(input) }
            ]);
            password = PasswordGenerator.generatePassword(parseInt(length));
        } else if (newPassword === confirmPassword) {
            password = newPassword;
        } else {
            console.log("Passwords do not match. Try again.");
        }
    }

    this.storage.PASSWORDS[site] = { username, password };
    this.storage.save();
    console.log('Password updated successfully!');
    clipboardy.writeSync(password); // Copy the actual password to clipboard
    console.log('Password has been copied to the clipboard!');

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: '\nPress Enter to return to the main menu' }
    ]);
    // await this.clearConsole();
}
async listAll() {
    console.log("List All Passwords");
  
    while (true) {
      const { password } = await inquirer.prompt([
        { type: 'password', name: 'password', message: 'Enter the Master Password' }
      ]);
  
      this.storage = new Storage(password);
  
      try {
        this.storage.load();
  
        if (password === this.storage.VERIFIED_PASSWORD) {
          console.log("All stored passwords:");
          if (Object.keys(this.storage.PASSWORDS).length === 0) {
            console.log("No passwords stored.");
          } else {
            const passwords = Object.entries(this.storage.PASSWORDS).map(([site, { username, password }]) => ({
              site,
              username,
              password: '*'.repeat(password.length)
            }));
  
            const { selectedPassword } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedPassword',
                message: 'Select a password to copy to clipboard or choose to return to the main menu:',
                choices: [
                  ...passwords.map(({ site, username }) => ({
                    name: `Site: ${site}, Username: ${username}`,
                    value: { site, password: this.storage.PASSWORDS[site].password }
                  })),
                  { name: 'Return to main menu', value: null }
                ]
              }
            ]);
  
            if (selectedPassword) {
              clipboardy.writeSync(selectedPassword.password);
              console.log(`Password for ${selectedPassword.site} has been copied to the clipboard!`);
            }
          }
  
          // Prompt to return to the main menu after displaying passwords
          await inquirer.prompt([
            { type: 'input', name: 'continue', message: '\nPress Enter to return to the main menu' }
          ]);
          await this.clearConsole();
          return; // Exit the method and return to the main menu
  
        } else {
          console.log("Incorrect Master Password! Please try again.");
          await inquirer.prompt([
            { type: 'input', name: 'continue', message: 'Press Enter to try again or Ctrl+C to exit.' }
          ]);
        }
      } catch (error) {
        console.log("Error loading data. Please try again.");
        await inquirer.prompt([
          { type: 'input', name: 'continue', message: 'Press Enter to return to the main menu' }
        ]);
        // await this.clearConsole();
        return; // Exit the method and return to the main menu
      }
    }
  }
  

  async changeMasterPassword() {
    console.log("Change Master Password");

    let oldPassword;
    while (true) {
        const { inputOldPassword } = await inquirer.prompt([
            { type: 'password', name: 'inputOldPassword', message: 'Enter the current Master Password' }
        ]);

        oldPassword = inputOldPassword;

        if (oldPassword === this.storage.VERIFIED_PASSWORD) {
            break;
        } else {
            console.log('Incorrect current Master Password. Please try again.');
        }
    }

    let newPassword;
    let confirmPassword;

    while (true) {
        const { inputNewPassword, inputConfirmPassword } = await inquirer.prompt([
            { type: 'password', name: 'inputNewPassword', message: 'Enter the new Master Password' },
            { type: 'password', name: 'inputConfirmPassword', message: 'Confirm the new Master Password' }
        ]);

        newPassword = inputNewPassword;
        confirmPassword = inputConfirmPassword;

        if (newPassword === confirmPassword) {
            this.storage.VERIFIED_PASSWORD = newPassword;
            this.storage.save();
            console.log('Master Password changed successfully!');
            break;
        } else {
            console.log('New passwords do not match. Please try again.');
        }
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: '\nPress Enter to return to the main menu' }
    ]);
    // await this.clearConsole();
}
}

// Example usage
const manager = new PasswordManager('Password Manager');
} -->
