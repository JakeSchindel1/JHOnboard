import { logger } from '@/lib/logger';

export class PowerAutomateService {
  private flowUrl: string;
  
  constructor() {
    this.flowUrl = process.env.POWER_AUTOMATE_FLOW_URL || '';
  }
  
  async sendFormData(formData: any) {
    try {
      const response = await fetch(this.flowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData
      };
    } catch (error) {
      logger.error('Power Automate submission failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 