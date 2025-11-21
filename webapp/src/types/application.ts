export interface OpportunityData {
  opportunityTitle?: string;
  opportunityDescription?: string;
  opportunityEligibility?: string;
  opportunityAgency?: string;
  opportunityCloseDate?: string;
  opportunityTotalFunding?: number;
  opportunityAwardMin?: number;
  opportunityAwardMax?: number;
  opportunityUrl?: string;
  opportunityAttachments?: Array<{
    url: string;
    title?: string;
    description?: string;
    type?: string;
  }>;
}

export interface CreateApplicationRequest extends OpportunityData {
  opportunityId?: number | null;
  organizationSlug: string;
  title?: string;
  alsoBookmark?: boolean;
  grantTitle?: string; // For backward compatibility
}

export interface UpdateApplicationOpportunityRequest extends OpportunityData {
  title?: string;
}
