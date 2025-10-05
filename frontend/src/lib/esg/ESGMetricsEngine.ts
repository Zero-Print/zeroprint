'use client';

// ============================================================================
// ESG METRICS CALCULATION ENGINE
// ============================================================================

export interface ESGRawData {
  // Environmental Data
  energyConsumption: number; // kWh
  renewableEnergyPercentage: number; // %
  waterUsage: number; // liters
  wasteGenerated: number; // kg
  wasteRecycled: number; // kg
  carbonEmissions: {
    scope1: number; // Direct emissions (kg CO2)
    scope2: number; // Indirect emissions from electricity (kg CO2)
    scope3?: number; // Other indirect emissions (kg CO2)
  };
  greenSpaceArea?: number; // sq meters
  
  // Social Data
  employeeCount: number;
  employeeSatisfaction: number; // 1-10 scale
  trainingHours: number; // total hours
  safetyIncidents: number;
  diversityMetrics: {
    genderDiversityRatio: number; // 0-1
    ageGroupDistribution: number[]; // percentages
    inclusionScore: number; // 1-100
  };
  communityEngagement: {
    volunteersHours: number;
    communityProjects: number;
    localSupplierPercentage: number; // %
  };
  
  // Governance Data
  boardComposition: {
    totalMembers: number;
    independentDirectors: number;
    womenDirectors: number;
  };
  complianceMetrics: {
    auditScore: number; // 1-100
    regulatoryViolations: number;
    ethicsTrainingCompletion: number; // %
  };
  transparency: {
    reportingQuality: number; // 1-100
    stakeholderEngagement: number; // 1-100
    dataAccuracy: number; // 1-100
  };
  
  // Entity-specific data
  entityType: 'school' | 'msme';
  entitySize: 'small' | 'medium' | 'large';
  industry?: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ESGCalculatedMetrics {
  environmental: {
    carbonIntensity: number; // kg CO2 per employee
    energyEfficiency: number; // kWh per employee
    waterEfficiency: number; // liters per employee
    wasteReductionRate: number; // %
    renewableEnergyScore: number; // 0-100
    overallScore: number; // 0-100
  };
  social: {
    employeeWellbeingScore: number; // 0-100
    diversityScore: number; // 0-100
    communityImpactScore: number; // 0-100
    safetyScore: number; // 0-100
    overallScore: number; // 0-100
  };
  governance: {
    boardEffectivenessScore: number; // 0-100
    complianceScore: number; // 0-100
    transparencyScore: number; // 0-100
    ethicsScore: number; // 0-100
    overallScore: number; // 0-100
  };
  overallESGScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  benchmarkComparison: {
    industryAverage: number;
    topPerformers: number;
    percentile: number;
  };
}

export class ESGMetricsEngine {
  private static instance: ESGMetricsEngine;
  
  public static getInstance(): ESGMetricsEngine {
    if (!ESGMetricsEngine.instance) {
      ESGMetricsEngine.instance = new ESGMetricsEngine();
    }
    return ESGMetricsEngine.instance;
  }

  /**
   * Calculate comprehensive ESG metrics from raw data
   */
  public calculateESGMetrics(rawData: ESGRawData): ESGCalculatedMetrics {
    const environmental = this.calculateEnvironmentalMetrics(rawData);
    const social = this.calculateSocialMetrics(rawData);
    const governance = this.calculateGovernanceMetrics(rawData);
    
    const overallESGScore = this.calculateOverallScore(environmental, social, governance);
    const riskLevel = this.assessRiskLevel(overallESGScore);
    const recommendations = this.generateRecommendations(rawData, environmental, social, governance);
    const benchmarkComparison = this.getBenchmarkComparison(rawData.entityType, rawData.industry, overallESGScore);

    return {
      environmental,
      social,
      governance,
      overallESGScore,
      riskLevel,
      recommendations,
      benchmarkComparison
    };
  }

  /**
   * Calculate Environmental metrics
   */
  private calculateEnvironmentalMetrics(data: ESGRawData) {
    const carbonIntensity = this.calculateCarbonIntensity(data);
    const energyEfficiency = data.energyConsumption / data.employeeCount;
    const waterEfficiency = data.waterUsage / data.employeeCount;
    const wasteReductionRate = (data.wasteRecycled / data.wasteGenerated) * 100;
    const renewableEnergyScore = Math.min(data.renewableEnergyPercentage * 2, 100); // Scale to 100
    
    // Calculate overall environmental score
    const scores = [
      this.scoreFromCarbonIntensity(carbonIntensity, data.entityType),
      this.scoreFromEnergyEfficiency(energyEfficiency, data.entityType),
      this.scoreFromWaterEfficiency(waterEfficiency, data.entityType),
      Math.min(wasteReductionRate, 100),
      renewableEnergyScore
    ];
    
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      carbonIntensity,
      energyEfficiency,
      waterEfficiency,
      wasteReductionRate,
      renewableEnergyScore,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Calculate Social metrics
   */
  private calculateSocialMetrics(data: ESGRawData) {
    const employeeWellbeingScore = this.calculateEmployeeWellbeing(data);
    const diversityScore = this.calculateDiversityScore(data.diversityMetrics);
    const communityImpactScore = this.calculateCommunityImpact(data.communityEngagement);
    const safetyScore = this.calculateSafetyScore(data.safetyIncidents, data.employeeCount);
    
    const overallScore = (employeeWellbeingScore + diversityScore + communityImpactScore + safetyScore) / 4;

    return {
      employeeWellbeingScore,
      diversityScore,
      communityImpactScore,
      safetyScore,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Calculate Governance metrics
   */
  private calculateGovernanceMetrics(data: ESGRawData) {
    const boardEffectivenessScore = this.calculateBoardEffectiveness(data.boardComposition);
    const complianceScore = this.calculateComplianceScore(data.complianceMetrics);
    const transparencyScore = this.calculateTransparencyScore(data.transparency);
    const ethicsScore = data.complianceMetrics.ethicsTrainingCompletion;
    
    const overallScore = (boardEffectivenessScore + complianceScore + transparencyScore + ethicsScore) / 4;

    return {
      boardEffectivenessScore,
      complianceScore,
      transparencyScore,
      ethicsScore,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Helper calculation methods
   */
  private calculateCarbonIntensity(data: ESGRawData): number {
    const totalEmissions = data.carbonEmissions.scope1 + data.carbonEmissions.scope2 + (data.carbonEmissions.scope3 || 0);
    return totalEmissions / data.employeeCount;
  }

  private scoreFromCarbonIntensity(intensity: number, entityType: string): number {
    // Benchmarks vary by entity type
    const benchmarks = {
      school: { excellent: 500, good: 1000, poor: 2000 },
      msme: { excellent: 1000, good: 2000, poor: 4000 }
    };
    
    const benchmark = benchmarks[entityType as keyof typeof benchmarks];
    if (intensity <= benchmark.excellent) return 100;
    if (intensity <= benchmark.good) return 75;
    if (intensity <= benchmark.poor) return 50;
    return 25;
  }

  private scoreFromEnergyEfficiency(efficiency: number, entityType: string): number {
    const benchmarks = {
      school: { excellent: 2000, good: 3000, poor: 5000 },
      msme: { excellent: 3000, good: 5000, poor: 8000 }
    };
    
    const benchmark = benchmarks[entityType as keyof typeof benchmarks];
    if (efficiency <= benchmark.excellent) return 100;
    if (efficiency <= benchmark.good) return 75;
    if (efficiency <= benchmark.poor) return 50;
    return 25;
  }

  private scoreFromWaterEfficiency(efficiency: number, entityType: string): number {
    const benchmarks = {
      school: { excellent: 50, good: 100, poor: 200 },
      msme: { excellent: 100, good: 200, poor: 400 }
    };
    
    const benchmark = benchmarks[entityType as keyof typeof benchmarks];
    if (efficiency <= benchmark.excellent) return 100;
    if (efficiency <= benchmark.good) return 75;
    if (efficiency <= benchmark.poor) return 50;
    return 25;
  }

  private calculateEmployeeWellbeing(data: ESGRawData): number {
    const satisfactionScore = (data.employeeSatisfaction / 10) * 100;
    const trainingScore = Math.min((data.trainingHours / data.employeeCount) * 2, 100);
    return (satisfactionScore + trainingScore) / 2;
  }

  private calculateDiversityScore(metrics: ESGRawData['diversityMetrics']): number {
    const genderScore = Math.min(metrics.genderDiversityRatio * 200, 100); // Optimal around 0.5
    const inclusionScore = metrics.inclusionScore;
    return (genderScore + inclusionScore) / 2;
  }

  private calculateCommunityImpact(engagement: ESGRawData['communityEngagement']): number {
    const volunteerScore = Math.min(engagement.volunteersHours / 10, 100);
    const projectScore = Math.min(engagement.communityProjects * 20, 100);
    const supplierScore = engagement.localSupplierPercentage;
    return (volunteerScore + projectScore + supplierScore) / 3;
  }

  private calculateSafetyScore(incidents: number, employeeCount: number): number {
    const incidentRate = (incidents / employeeCount) * 1000; // Per 1000 employees
    if (incidentRate === 0) return 100;
    if (incidentRate <= 5) return 90;
    if (incidentRate <= 10) return 75;
    if (incidentRate <= 20) return 50;
    return 25;
  }

  private calculateBoardEffectiveness(board: ESGRawData['boardComposition']): number {
    const independenceRatio = board.independentDirectors / board.totalMembers;
    const genderDiversityRatio = board.womenDirectors / board.totalMembers;
    
    const independenceScore = Math.min(independenceRatio * 200, 100);
    const diversityScore = Math.min(genderDiversityRatio * 200, 100);
    
    return (independenceScore + diversityScore) / 2;
  }

  private calculateComplianceScore(metrics: ESGRawData['complianceMetrics']): number {
    const auditScore = metrics.auditScore;
    const violationPenalty = Math.max(0, 100 - (metrics.regulatoryViolations * 20));
    return (auditScore + violationPenalty) / 2;
  }

  private calculateTransparencyScore(transparency: ESGRawData['transparency']): number {
    return (transparency.reportingQuality + transparency.stakeholderEngagement + transparency.dataAccuracy) / 3;
  }

  private calculateOverallScore(environmental: any, social: any, governance: any): number {
    // Weighted average: Environmental 40%, Social 35%, Governance 25%
    return Math.round(
      (environmental.overallScore * 0.4) +
      (social.overallScore * 0.35) +
      (governance.overallScore * 0.25)
    );
  }

  private assessRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }

  private generateRecommendations(rawData: ESGRawData, env: any, social: any, gov: any): string[] {
    const recommendations: string[] = [];

    // Environmental recommendations
    if (env.renewableEnergyScore < 50) {
      recommendations.push('Increase renewable energy adoption to reduce carbon footprint');
    }
    if (env.wasteReductionRate < 60) {
      recommendations.push('Implement comprehensive waste reduction and recycling programs');
    }
    if (env.energyEfficiency > (rawData.entityType === 'school' ? 3000 : 5000)) {
      recommendations.push('Invest in energy-efficient equipment and building improvements');
    }

    // Social recommendations
    if (social.employeeWellbeingScore < 70) {
      recommendations.push('Enhance employee satisfaction through better benefits and work environment');
    }
    if (social.diversityScore < 60) {
      recommendations.push('Develop diversity and inclusion initiatives');
    }
    if (social.safetyScore < 80) {
      recommendations.push('Strengthen workplace safety protocols and training');
    }

    // Governance recommendations
    if (gov.boardEffectivenessScore < 70) {
      recommendations.push('Improve board composition with more independent and diverse directors');
    }
    if (gov.complianceScore < 80) {
      recommendations.push('Strengthen compliance monitoring and audit processes');
    }
    if (gov.transparencyScore < 75) {
      recommendations.push('Enhance transparency in reporting and stakeholder communication');
    }

    return recommendations;
  }

  private getBenchmarkComparison(entityType: string, industry: string | undefined, score: number) {
    // Mock benchmark data - in real implementation, this would come from a database
    const benchmarks = {
      school: { industryAverage: 65, topPerformers: 85 },
      msme: { industryAverage: 58, topPerformers: 78 }
    };

    const benchmark = benchmarks[entityType as keyof typeof benchmarks];
    const percentile = this.calculatePercentile(score, benchmark.industryAverage);

    return {
      industryAverage: benchmark.industryAverage,
      topPerformers: benchmark.topPerformers,
      percentile
    };
  }

  private calculatePercentile(score: number, average: number): number {
    // Simplified percentile calculation
    if (score >= average * 1.3) return 90;
    if (score >= average * 1.2) return 80;
    if (score >= average * 1.1) return 70;
    if (score >= average) return 60;
    if (score >= average * 0.9) return 50;
    if (score >= average * 0.8) return 40;
    if (score >= average * 0.7) return 30;
    if (score >= average * 0.6) return 20;
    return 10;
  }

  /**
   * Generate mock data for testing
   */
  public generateMockData(entityType: 'school' | 'msme', entitySize: 'small' | 'medium' | 'large' = 'medium'): ESGRawData {
    const baseEmployeeCount = entitySize === 'small' ? 50 : entitySize === 'medium' ? 200 : 500;
    
    return {
      energyConsumption: baseEmployeeCount * (2000 + Math.random() * 2000),
      renewableEnergyPercentage: 20 + Math.random() * 60,
      waterUsage: baseEmployeeCount * (80 + Math.random() * 120),
      wasteGenerated: baseEmployeeCount * (10 + Math.random() * 20),
      wasteRecycled: baseEmployeeCount * (5 + Math.random() * 15),
      carbonEmissions: {
        scope1: baseEmployeeCount * (800 + Math.random() * 400),
        scope2: baseEmployeeCount * (600 + Math.random() * 600),
        scope3: baseEmployeeCount * (200 + Math.random() * 300)
      },
      greenSpaceArea: baseEmployeeCount * (5 + Math.random() * 15),
      employeeCount: baseEmployeeCount,
      employeeSatisfaction: 6 + Math.random() * 3,
      trainingHours: baseEmployeeCount * (20 + Math.random() * 40),
      safetyIncidents: Math.floor(Math.random() * 5),
      diversityMetrics: {
        genderDiversityRatio: 0.3 + Math.random() * 0.4,
        ageGroupDistribution: [30, 40, 20, 10],
        inclusionScore: 60 + Math.random() * 30
      },
      communityEngagement: {
        volunteersHours: baseEmployeeCount * (5 + Math.random() * 15),
        communityProjects: 2 + Math.floor(Math.random() * 6),
        localSupplierPercentage: 40 + Math.random() * 40
      },
      boardComposition: {
        totalMembers: 5 + Math.floor(Math.random() * 5),
        independentDirectors: 2 + Math.floor(Math.random() * 3),
        womenDirectors: 1 + Math.floor(Math.random() * 3)
      },
      complianceMetrics: {
        auditScore: 70 + Math.random() * 25,
        regulatoryViolations: Math.floor(Math.random() * 3),
        ethicsTrainingCompletion: 80 + Math.random() * 15
      },
      transparency: {
        reportingQuality: 70 + Math.random() * 25,
        stakeholderEngagement: 65 + Math.random() * 30,
        dataAccuracy: 85 + Math.random() * 10
      },
      entityType,
      entitySize,
      industry: entityType === 'msme' ? 'Technology' : undefined,
      reportingPeriod: {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31)
      }
    };
  }
}

export default ESGMetricsEngine;