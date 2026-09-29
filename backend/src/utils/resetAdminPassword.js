const mongoose = require('mongoose');
const readline = require('node:readline');
const env = require('../config/env');
const User = require('../models/User');

const askVisible = (prompt) => new Promise((resolve) => {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  terminal.question(prompt, (answer) => {
    terminal.close();
    resolve(answer.trim());
  });
});

const askSecret = (prompt) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    reject(new Error('Run this command in an interactive terminal so the new password can be entered without echo.'));
    return;
  }

  process.stdout.write(prompt);
  let value = '';
  const onData = (chunk) => {
    for (const character of chunk.toString('utf8')) {
      if (character === '\u0003') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off('data', onData);
        reject(new Error('Password reset cancelled.'));
        return;
      }
      if (character === '\r' || character === '\n') {
        process.stdout.write('\n');
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off('data', onData);
        resolve(value);
        return;
      }
      if (character === '\u007f' || character === '\b') {
        value = value.slice(0, -1);
        continue;
      }
      if (character >= ' ') value += character;
    }
  };

  process.stdin.resume();
  process.stdin.setRawMode(true);
  process.stdin.on('data', onData);
});

const resetAdminPassword = async () => {
  try {
    const email = await askVisible('Admin email: ');
    if (!email) throw new Error('Admin email is required.');

    const password = await askSecret('New password (hidden): ');
    if (password.length < 12) throw new Error('Use a password with at least 12 characters.');
    const confirmation = await askSecret('Confirm new password (hidden): ');
    if (password !== confirmation) throw new Error('The passwords do not match. No change was made.');

    await mongoose.connect(env.MONGODB_URI);
    const admin = await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' });
    if (!admin) throw new Error('No admin account was found for that email.');

    admin.passwordHash = password;
    await admin.save();
    console.log(`Password reset successfully for admin account ${admin.email}.`);
  } catch (error) {
    console.error(`Admin password reset failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  }
};

resetAdminPassword();