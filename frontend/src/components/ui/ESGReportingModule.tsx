'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Heart,
  Building2,
  Zap,
  Droplets,
  Recycle,
  TreePine,
  Factory,
  Briefcase,
  GraduationCap,
  Scale
} from 'lucide-react';

// ============================================================================
// ESG INTERFACES
// ============================================================================

export interface ESGMetrics {
  environmental: EnvironmentalMetrics;
  social: SocialMetrics;
  governance: GovernanceMetrics;
  overallScore: number;
  reportingPeriod: string;
  lastUpdated: Date;
  complianceStatus: 'compliant' | 'partial' | 'non-compliant';
}

export interface EnvironmentalMetrics {
  carbonFootprint: {
    totalEmissions: number;
    emissionsReduced: number;
    carbonNeutralityProgress: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
  };
  energyManagement: {
    renewableEnergyPercentage: number;
    energyEfficiencyScore: number;
    totalEnergyConsumption: number;
    energySavings: number;
  };
  wasteManagement: {
    wasteReductionPercentage: number;
    recyclingRate: number;
    wasteToLandfill: number;
    circularEconomyScore: number;
  };
  waterManagement: {
    waterConsumption: number;
    waterSavings: number;
    waterRecyclingRate: number;
    waterEfficiencyScore: number;
  };
  biodiversity: {
    greenSpaceArea: number;
    biodiversityIndex: number;
    conservationProjects: number;
    ecosystemImpactScore: number;
  };
  score: number;
}

export interface SocialMetrics {
  employeeWellbeing: {
    satisfactionScore: number;
    mentalHealthSupport: number;
    workLifeBalance: number;
    safetyIncidents: number;
  };
  diversityInclusion: {
    genderDiversityRatio: number;
    ethnicDiversityIndex: number;
    inclusionScore: number;
    payEquityRatio: number;
  };
  communityEngagement: {
    volunteerHours: number;
    communityInvestment: number;
    localPartnershipCount: number;
    socialImpactScore: number;
  };
  education: {
    trainingHours: number;
    skillDevelopmentPrograms: number;
    educationPartnerships: number;
    knowledgeSharingScore: number;
  };
  healthSafety: {
    safetyScore: number;
    healthProgramParticipation: number;
    accidentRate: number;
    wellnessInitiatives: number;
  };
  score: number;
}

export interface GovernanceMetrics {
  ethicalBusiness: {
    ethicsTrainingCompletion: number;
    corruptionIncidents: number;
    whistleblowerReports: number;
    ethicsScore: number;
  };
  transparency: {
    reportingTransparency: number;
    stakeholderEngagement: number;
    dataPrivacyCompliance: number;
    transparencyScore: number;
  };
  riskManagement: {
    riskAssessmentScore: number;
    complianceViolations: number;
    auditFindings: number;
    riskMitigationScore: number;
  };
  boardDiversity: {
    boardDiversityRatio: number;
    independentDirectors: number;
    boardEffectivenessScore: number;
    leadershipDiversityScore: number;
  };
  stakeholderRights: {
    stakeholderSatisfaction: number;
    grievanceResolution: number;
    stakeholderEngagementScore: number;
    rightsProtectionScore: number;
  };
  score: number;
}

// ============================================================================
// ESG REPORTING MODULE COMPONENT
// ============================================================================

interface ESGReportingModuleProps {
  entityId: string;
  entityType: 'school' | 'msme';
  reportingPeriod?: 'monthly' | 'quarterly' | 'annual';
  onExportReport?: (format: 'pdf' | 'csv' | 'excel') => void;
}

export const ESGReportingModule: React.FC<ESGReportingModuleProps> = ({
  entityId,
  entityType,
  reportingPeriod = 'quarterly',
  onExportReport
}) => {
  const [esgMetrics, setESGMetrics] = useState<ESGMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'environmental' | 'social' | 'governance'>('environmental');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('3m');

  useEffect(() => {
    loadESGData();
  }, [entityId, entityType, reportingPeriod]);

  const loadESGData = async () => {
    setLoading(true);
    try {
      // Mock ESG data - in real implementation, this would fetch from analytics
      const mockESGData: ESGMetrics = {
        environmental: {
          carbonFootprint: {
            totalEmissions: 1250,
            emissionsReduced: 320,
            carbonNeutralityProgress: 68,
            scope1Emissions: 450,
            scope2Emissions: 600,
            scope3Emissions: 200
          },
          energyManagement: {
            renewableEnergyPercentage: 45,
            energyEfficiencyScore: 78,
            totalEnergyConsumption: 2400,
            energySavings: 15
          },
          wasteManagement: {
            wasteReductionPercentage: 35,
            recyclingRate: 72,
            wasteToLandfill: 180,
            circularEconomyScore: 65
          },
          waterManagement: {
            waterConsumption: 1800,
            waterSavings: 22,
            waterRecyclingRate: 40,
            waterEfficiencyScore: 71
          },
          biodiversity: {
            greenSpaceArea: 2500,
            biodiversityIndex: 0.75,
            conservationProjects: 3,
            ecosystemImpactScore: 82
          },
          score: 74
        },
        social: {
          employeeWellbeing: {
            satisfactionScore: 8.2,
            mentalHealthSupport: 85,
            workLifeBalance: 7.8,
            safetyIncidents: 2
          },
          diversityInclusion: {
            genderDiversityRatio: 0.52,
            ethnicDiversityIndex: 0.68,
            inclusionScore: 79,
            payEquityRatio: 0.94
          },
          communityEngagement: {
            volunteerHours: 1240,
            communityInvestment: 45000,
            localPartnershipCount: 12,
            socialImpactScore: 88
          },
          education: {
            trainingHours: 2800,
            skillDevelopmentPrograms: 15,
            educationPartnerships: 8,
            knowledgeSharingScore: 91
          },
          healthSafety: {
            safetyScore: 92,
            healthProgramParticipation: 78,
            accidentRate: 0.02,
            wellnessInitiatives: 6
          },
          score: 84
        },
        governance: {
          ethicalBusiness: {
            ethicsTrainingCompletion: 96,
            corruptionIncidents: 0,
            whistleblowerReports: 1,
            ethicsScore: 94
          },
          transparency: {
            reportingTransparency: 89,
            stakeholderEngagement: 82,
            dataPrivacyCompliance: 95,
            transparencyScore: 88
          },
          riskManagement: {
            riskAssessmentScore: 87,
            complianceViolations: 0,
            auditFindings: 2,
            riskMitigationScore: 91
          },
          boardDiversity: {
            boardDiversityRatio: 0.45,
            independentDirectors: 60,
            boardEffectivenessScore: 85,
            leadershipDiversityScore: 72
          },
          stakeholderRights: {
            stakeholderSatisfaction: 8.5,
            grievanceResolution: 95,
            stakeholderEngagementScore: 86,
            rightsProtectionScore: 92
          },
          score: 87
        },
        overallScore: 82,
        reportingPeriod: 'Q3 2024',
        lastUpdated: new Date(),
        complianceStatus: 'compliant'
      };

      setESGMetrics(mockESGData);
    } catch (error) {
      console.error('Error loading ESG data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    if (onExportReport) {
      onExportReport(format);
    } else {
      console.log(`Exporting ESG report as ${format}`);
      // Default export logic
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!esgMetrics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600">Unable to load ESG metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ESG Reporting Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Environmental, Social & Governance metrics for {reportingPeriod} reporting
          </p>
          <div className="flex items-center gap-4 mt-2">
            <ZPBadge variant={esgMetrics.complianceStatus === 'compliant' ? 'success' : 'warning'}>
              {esgMetrics.complianceStatus === 'compliant' ? 'Compliant' : 'Needs Attention'}
            </ZPBadge>
            <span className="text-sm text-gray-500">
              Last updated: {esgMetrics.lastUpdated.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <ZPButton variant="outline" size="sm" onClick={() => loadESGData()}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </ZPButton>
          <div className="flex gap-1">
            <ZPButton variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </ZPButton>
            <ZPButton variant="outline" size="sm" onClick={() => handleExport('excel')}>
              Excel
            </ZPButton>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <ZPCard title="Overall ESG Score" description={`Comprehensive sustainability performance for ${esgMetrics.reportingPeriod}`}>
        <div className="text-center py-6">
          <div className={`text-6xl font-bold ${getScoreColor(esgMetrics.overallScore)} mb-2`}>
            {esgMetrics.overallScore}
          </div>
          <div className="text-gray-600 mb-4">out of 100</div>
          <ZPBadge variant={getScoreBadgeVariant(esgMetrics.overallScore)} size="lg">
            {esgMetrics.overallScore >= 80 ? 'Excellent' : 
             esgMetrics.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
          </ZPBadge>
        </div>
      </ZPCard>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ZPCard 
          title="Environmental" 
          description="Carbon footprint, energy, waste & water management"
          className={selectedCategory === 'environmental' ? 'ring-2 ring-green-500' : ''}
          onClick={() => setSelectedCategory('environmental')}
        >
          <div className="text-center py-4">
            <Leaf className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <div className={`text-3xl font-bold ${getScoreColor(esgMetrics.environmental.score)} mb-2`}>
              {esgMetrics.environmental.score}
            </div>
            <ZPBadge variant={getScoreBadgeVariant(esgMetrics.environmental.score)}>
              Environmental
            </ZPBadge>
          </div>
        </ZPCard>

        <ZPCard 
          title="Social" 
          description="Employee wellbeing, diversity, community engagement"
          className={selectedCategory === 'social' ? 'ring-2 ring-blue-500' : ''}
          onClick={() => setSelectedCategory('social')}
        >
          <div className="text-center py-4">
            <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <div className={`text-3xl font-bold ${getScoreColor(esgMetrics.social.score)} mb-2`}>
              {esgMetrics.social.score}
            </div>
            <ZPBadge variant={getScoreBadgeVariant(esgMetrics.social.score)}>
              Social
            </ZPBadge>
          </div>
        </ZPCard>

        <ZPCard 
          title="Governance" 
          description="Ethics, transparency, risk management"
          className={selectedCategory === 'governance' ? 'ring-2 ring-purple-500' : ''}
          onClick={() => setSelectedCategory('governance')}
        >
          <div className="text-center py-4">
            <Shield className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <div className={`text-3xl font-bold ${getScoreColor(esgMetrics.governance.score)} mb-2`}>
              {esgMetrics.governance.score}
            </div>
            <ZPBadge variant={getScoreBadgeVariant(esgMetrics.governance.score)}>
              Governance
            </ZPBadge>
          </div>
        </ZPCard>
      </div>

      {/* Detailed Metrics */}
      {selectedCategory === 'environmental' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Carbon Footprint" description="Emissions tracking and reduction progress">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Carbon Neutrality Progress</span>
                <span className="text-green-600 font-bold">{esgMetrics.environmental.carbonFootprint.carbonNeutralityProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${esgMetrics.environmental.carbonFootprint.carbonNeutralityProgress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{esgMetrics.environmental.carbonFootprint.scope1Emissions}</div>
                  <div className="text-xs text-gray-500">Scope 1</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{esgMetrics.environmental.carbonFootprint.scope2Emissions}</div>
                  <div className="text-xs text-gray-500">Scope 2</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{esgMetrics.environmental.carbonFootprint.scope3Emissions}</div>
                  <div className="text-xs text-gray-500">Scope 3</div>
                </div>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Energy Management" description="Renewable energy and efficiency metrics">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Renewable Energy</span>
                </div>
                <span className="text-yellow-600 font-bold">{esgMetrics.environmental.energyManagement.renewableEnergyPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Efficiency Score</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.environmental.energyManagement.energyEfficiencyScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Energy Savings</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.environmental.energyManagement.energySavings}%</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Waste Management" description="Waste reduction and recycling metrics">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Recycle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Recycling Rate</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.environmental.wasteManagement.recyclingRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Waste Reduction</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.environmental.wasteManagement.wasteReductionPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Circular Economy</span>
                </div>
                <span className="text-purple-600 font-bold">{esgMetrics.environmental.wasteManagement.circularEconomyScore}/100</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Water & Biodiversity" description="Water conservation and ecosystem impact">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Water Savings</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.environmental.waterManagement.waterSavings}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Green Space</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.environmental.biodiversity.greenSpaceArea} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Ecosystem Impact</span>
                </div>
                <span className="text-yellow-600 font-bold">{esgMetrics.environmental.biodiversity.ecosystemImpactScore}/100</span>
              </div>
            </div>
          </ZPCard>
        </div>
      )}

      {selectedCategory === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Employee Wellbeing" description="Satisfaction, mental health, and work-life balance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Satisfaction Score</span>
                </div>
                <span className="text-red-600 font-bold">{esgMetrics.social.employeeWellbeing.satisfactionScore}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Mental Health Support</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.social.employeeWellbeing.mentalHealthSupport}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Work-Life Balance</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.social.employeeWellbeing.workLifeBalance}/10</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Diversity & Inclusion" description="Gender diversity, inclusion, and pay equity">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Gender Diversity</span>
                </div>
                <span className="text-purple-600 font-bold">{Math.round(esgMetrics.social.diversityInclusion.genderDiversityRatio * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Inclusion Score</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.social.diversityInclusion.inclusionScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Pay Equity</span>
                </div>
                <span className="text-green-600 font-bold">{Math.round(esgMetrics.social.diversityInclusion.payEquityRatio * 100)}%</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Community Engagement" description="Volunteer work and social impact initiatives">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Volunteer Hours</span>
                </div>
                <span className="text-red-600 font-bold">{esgMetrics.social.communityEngagement.volunteerHours}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Local Partnerships</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.social.communityEngagement.localPartnershipCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Social Impact</span>
                </div>
                <span className="text-yellow-600 font-bold">{esgMetrics.social.communityEngagement.socialImpactScore}/100</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Education & Health" description="Training programs and health initiatives">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Training Hours</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.social.education.trainingHours}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Safety Score</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.social.healthSafety.safetyScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Health Programs</span>
                </div>
                <span className="text-purple-600 font-bold">{esgMetrics.social.healthSafety.healthProgramParticipation}%</span>
              </div>
            </div>
          </ZPCard>
        </div>
      )}

      {selectedCategory === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZPCard title="Ethical Business" description="Ethics training and corruption prevention">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Ethics Training</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.governance.ethicalBusiness.ethicsTrainingCompletion}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Corruption Incidents</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.governance.ethicalBusiness.corruptionIncidents}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Ethics Score</span>
                </div>
                <span className="text-yellow-600 font-bold">{esgMetrics.governance.ethicalBusiness.ethicsScore}/100</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Transparency" description="Reporting transparency and stakeholder engagement">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Reporting Transparency</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.governance.transparency.reportingTransparency}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Stakeholder Engagement</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.governance.transparency.stakeholderEngagement}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Data Privacy</span>
                </div>
                <span className="text-purple-600 font-bold">{esgMetrics.governance.transparency.dataPrivacyCompliance}%</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Risk Management" description="Risk assessment and compliance monitoring">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Risk Assessment</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.governance.riskManagement.riskAssessmentScore}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Compliance Violations</span>
                </div>
                <span className="text-green-600 font-bold">{esgMetrics.governance.riskManagement.complianceViolations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Risk Mitigation</span>
                </div>
                <span className="text-yellow-600 font-bold">{esgMetrics.governance.riskManagement.riskMitigationScore}/100</span>
              </div>
            </div>
          </ZPCard>

          <ZPCard title="Leadership & Stakeholder Rights" description="Board diversity and stakeholder satisfaction">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Board Diversity</span>
                </div>
                <span className="text-purple-600 font-bold">{Math.round(esgMetrics.governance.boardDiversity.boardDiversityRatio * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Stakeholder Satisfaction</span>
                </div>
                <span className="text-red-600 font-bold">{esgMetrics.governance.stakeholderRights.stakeholderSatisfaction}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Rights Protection</span>
                </div>
                <span className="text-blue-600 font-bold">{esgMetrics.governance.stakeholderRights.rightsProtectionScore}/100</span>
              </div>
            </div>
          </ZPCard>
        </div>
      )}
    </div>
  );
};

export default ESGReportingModule;