export class PasswordGenerator {
            static contextFilter = [
                "gmail", "email", "com", "in", "co", "uk", "outlook",
                "onedrive", "yahoo", "google", "test", "password",
                "admin", "user", "login", "secure", "key", "root",
                "123456", "qwerty", "abc123", "password123", "letmein",
                // Add more entries as required
            ];
        
            static similarChars = {
                "i": "l", "l": "i",
                "o": "0", "0": "o",
                "s": "5", "5": "s",
                "b": "8", "8": "b",
                "g": "9", "9": "g",
                "z": "2", "2": "z",
                "q": "9", "9": "q",
                "1": "l", "l": "1",
                "3": "e", "e": "3",
                "a": "4", "4": "a",
                "t": "7", "7": "t"
            };
        
            static contextChecker(s) {
                return !this.contextFilter.some(filter => s.toLowerCase().includes(filter));
            }
        
            static breakContext(s) {
                return s.split(/\W+/).filter(substr => substr && this.contextChecker(substr));
            }
        
            static generatePassword(context, length = 15, upperCase = true, lowerCase = true, numbers = true, symbols = true, excludeSimilar = false) {
                if (length <= 0) throw new Error("Length of password must be a natural number.");
        
                let allowedChars = '';
                if (upperCase) allowedChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (lowerCase) allowedChars += 'abcdefghijklmnopqrstuvwxyz';
                if (numbers) allowedChars += '0123456789';
                if (symbols) allowedChars += '!@#$%^&*()_+[]{}|;:,.<>?';
        
                if (!allowedChars) throw new Error("No characters available to generate password.");
        
                let contextList = context.flatMap(string => this.breakContext(string));
                if (!contextList.length) contextList = context;
        
                let password = [];
                contextList.forEach(item => {
                    if (Math.random() > 0.5) {
                        password.push(item);
                    } else {
                        password.push(Array.from({ length: item.length }, () => allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))).join(''));
                    }
                });
        
                let passwordStr = password.join('').split('').sort(() => 0.5 - Math.random()).join('');
        
                if (excludeSimilar) {
                    passwordStr = passwordStr.split('').map(ch => this.similarChars[ch] || ch).join('');
                }
        
                if (passwordStr.length < length) {
                    passwordStr += Array.from({ length: length - passwordStr.length }, () => allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))).join('');
                } else if (passwordStr.length > length) {
                    passwordStr = passwordStr.slice(0, length);
                }
        
                return passwordStr.split('').map(ch => allowedChars.includes(ch) ? ch : allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))).join('');
            }
        }
        