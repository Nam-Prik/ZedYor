import { Hono } from 'hono'
import incidentReportRoutes from './incident-report.routes.js'
import laborReportRoutes from './labor-report.routes.js'
import maintainanceRoutes from './maintainance.routes.js'
import maintainerRoutes from './maintainer.routes.js'
import prisonLocationRoutes from './prison-location.routes.js'

const router = new Hono()

router.route('/maintainer', maintainerRoutes)
router.route('/maintainance', maintainanceRoutes)
router.route('/prison-location', prisonLocationRoutes)
router.route('/labor-reports', laborReportRoutes)
router.route('/incident-reports', incidentReportRoutes)

export default router
