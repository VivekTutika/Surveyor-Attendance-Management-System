"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const surveyorController_1 = require("../controllers/surveyorController");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All surveyor routes require admin privileges
router.use(authMiddleware_1.adminMiddleware);
// CRUD operations
router.post('/', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.createSurveyor), surveyorController_1.SurveyorController.createSurveyor);
router.get('/', surveyorController_1.SurveyorController.getSurveyors);
router.get('/projects', surveyorController_1.SurveyorController.getProjects);
router.get('/locations', surveyorController_1.SurveyorController.getLocations);
router.get('/:id', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), surveyorController_1.SurveyorController.getSurveyorById);
router.put('/:id', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.updateSurveyor), surveyorController_1.SurveyorController.updateSurveyor);
router.delete('/:id', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), surveyorController_1.SurveyorController.deleteSurveyor);
// Additional operations
router.post('/:id/reset-password', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), surveyorController_1.SurveyorController.resetSurveyorPassword);
router.get('/:id/statistics', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.dateQuery), surveyorController_1.SurveyorController.getSurveyorStatistics);
exports.default = router;
//# sourceMappingURL=surveyorRoutes.js.map