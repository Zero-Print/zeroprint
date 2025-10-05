import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";

interface DashboardDataRequest { timeframe?: string }

export const getSchoolDashboardData = functions.https.onCall(
  {region: "asia-south1"},
  async (_request: CallableRequest<DashboardDataRequest>) => {
    // Placeholder mock response
    return {
      entityStats: {classrooms: 12, activeStudents: 320, carbonReduction: 1250},
      classKPIs: [
        {class: "10-A", active: 28, carbonReduction: 210},
        {class: "10-B", active: 25, carbonReduction: 185},
      ],
      reports: [{id: "r1", name: "Monthly ESG", status: "ready"}],
    };
  }
);


