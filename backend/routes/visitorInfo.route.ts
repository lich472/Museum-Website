
import { Router } from 'express'
import { protectRoute, adminRoute } from "../middleware/auth.middleware.ts";

import {
  getVisitorInfo,
  updateVisitorInfo,
} from '../controllers/visitorInfo.controller'

const router = Router()

router.get('/', getVisitorInfo)
router.put('/',protectRoute, adminRoute, updateVisitorInfo)

export default router
