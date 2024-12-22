import redisClient from "../redis/index.js";
import {
  addUser,
  clearDatabase,
  deleteUser,
  deleteUserPermanently,
  findUser,
  allUsers,
  searchUsersByName,
  searchUsersByEmail,
} from "./userController.js";

import { signin, signup, sendOTP, verifyOTP } from "./authController.js";
async function adminConsole() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "create-admin": {
      const email = args[1];
      const password = args[2];
      const name = args[3];
      if (!email || !password || !name) {
        console.log("Usage: node console.js signup <email> <password> <name>");
        return;
      }
      const result = await createAdmin(email, password, name);
      console.log(result);
      break;
    }
    case "signup": {
      const email = args[1];
      const password = args[2];
      const name = args[3];
      if (!email || !password || !name) {
        console.log("Usage: node console.js signup <email> <password> <name>");
        return;
      }
      const req = { body: { email, password, name } };
      const res = {};
      const result = await signup(req, res);
      console.log(result);
      break;
    }

    case "signin": {
      const email = args[1];
      const password = args[2];
      if (!email || !password) {
        console.log("Usage: node console.js signin <email> <password>");
        return;
      }
      const req = { body: { email, password } };
      const res = {};
      const result = await signin(req, res);
      console.log(result);
      break;
    }
    case "clearRedis": {
      const result = await redisClient.flushDb();
      console.log(result);
      break;
    }
    case "clearDatabase": {
      const result = await clearDatabase();
      console.log(result);
      break;
    }

    case "addUser": {
      const email = args[1];
      const password = args[2];
      const name = args[3];
      if (!email || !password || !name) {
        console.log("Usage: node console.js addUser <email> <password> <name>");
        return;
      }
      const result = await addUser(email, password, name);
      console.log(result);
      break;
    }

    case "deleteUser": {
      const id = args[1];
      if (!id) {
        console.log("Usage: node console.js deleteUser <id>");
        return;
      }
      const result = await deleteUser(id);
      console.log(result);
      break;
    }

    case "deleteUserPermanently": {
      const id = args[1];
      if (!id) {
        console.log("Usage: node console.js deleteUserPermanently <id>");
        return;
      }
      const result = await deleteUserPermanently(id);
      console.log(result);
      break;
    }

    case "findUser": {
      const id = args[1];
      if (!id) {
        console.log("Usage: node console.js findUser <id>");
        return;
      }
      const result = await findUser(id);
      console.log(result);
      break;
    }

    case "allUsers": {
      const result = await allUsers();
      console.log(result);
      break;
    }

    case "searchUsersByName": {
      const name = args[1];
      if (!name) {
        console.log("Usage: node console.js searchUsersByName <name>");
        return;
      }
      const result = await searchUsersByName(name);
      console.log(result);
      break;
    }

    case "searchUsersByemail": {
      const email = args[1];
      if (!email) {
        console.log("Usage: node console.js searchUsersByemail <email>");
        return;
      }
      const result = await searchUsersByemail(email);
      console.log(result);
      break;
    }

    default:
      console.log("Unknown command. Available commands:");
      console.log(`
          signup <email> <password> <name>
          signin <email> <password>
          clearDatabase
          addUser <email> <password> <name>
          deleteUser <id>
          deleteUserPermanently <id>
          findUser <id>
          allUsers
          searchUsersByName <name>
          searchUsersByemail <email>
        `);
      break;
  }

  // Disconnect the Prisma client
}
adminConsole();
