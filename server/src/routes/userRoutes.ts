import {Router} from "express";
import {
  login,
  logout,
  signUp,
} from "../controllers/userController.js";

const authRouter:Router = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.get("/logout", logout);


export default authRouter;