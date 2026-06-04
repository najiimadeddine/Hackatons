import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import hackathonsRouter from "./hackathons";
import teamsRouter from "./teams";
import projectsRouter from "./projects";
import ticketsRouter from "./tickets";
import chatRouter from "./chat";
import analyticsRouter from "./analytics";
import portfoliosRouter from "./portfolios";
import adminRouter from "./admin";
import anthropicRouter from "./anthropic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(hackathonsRouter);
router.use(teamsRouter);
router.use(projectsRouter);
router.use(ticketsRouter);
router.use(chatRouter);
router.use(analyticsRouter);
router.use(portfoliosRouter);
router.use(adminRouter);
router.use(anthropicRouter);

export default router;
