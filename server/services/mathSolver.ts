export interface MathStep {
  title: string;
  description: string;
  math?: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

export interface MathSolution {
  steps: MathStep[];
  finalAnswer: string;
  confidence: number;
  source: 'huggingface' | 'webscraping' | 'manual';
}

export class MathSolver {
  private huggingfaceToken: string;

  constructor() {
    this.huggingfaceToken = process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_TOKEN || '';
  }

  async solveMathProblem(question: string, language: string = 'fr'): Promise<MathSolution> {
    try {
      // Try HuggingFace first
      const hfResult = await this.tryHuggingFace(question, language);
      if (hfResult) {
        return hfResult;
      }

      // Fallback to web scraping
      const scrapingResult = await this.tryWebScraping(question, language);
      if (scrapingResult) {
        return scrapingResult;
      }

      // Final fallback - basic pattern matching
      return this.basicMathSolver(question, language);
    } catch (error) {
      console.error('Math solving error:', error);
      return this.getErrorSolution(language);
    }
  }

  private async tryHuggingFace(question: string, language: string): Promise<MathSolution | null> {
    if (!this.huggingfaceToken) {
      console.warn('HuggingFace API token not configured');
      return null;
    }

    try {
      // Try multiple HuggingFace math models
      const models = [
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill',
        'microsoft/DialoGPT-small'
      ];

      for (const model of models) {
        try {
          const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.huggingfaceToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: this.formatQuestionForHF(question, language),
              parameters: {
                max_length: 500,
                temperature: 0.7,
                do_sample: true,
              }
            }),
          });

          if (response.ok) {
            const result = await response.json();
            return this.parseHuggingFaceResponse(result, language);
          }
        } catch (modelError) {
          console.warn(`Model ${model} failed:`, modelError);
          continue;
        }
      }
    } catch (error) {
      console.error('HuggingFace API error:', error);
    }

    return null;
  }

  private formatQuestionForHF(question: string, language: string): string {
    const prompts = {
      fr: `Résolvez ce problème mathématique étape par étape: ${question}`,
      ar: `حل هذه المسألة الرياضية خطوة بخطوة: ${question}`,
      tn: `حل هذه المسألة الرياضية خطوة بخطوة: ${question}`
    };
    return prompts[language as keyof typeof prompts] || prompts.fr;
  }

  private parseHuggingFaceResponse(result: any, language: string): MathSolution {
    let responseText = '';
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      responseText = result[0].generated_text;
    } else if (result.generated_text) {
      responseText = result.generated_text;
    }

    // Parse the response into steps
    const steps = this.parseResponseIntoSteps(responseText, language);
    
    return {
      steps,
      finalAnswer: this.extractFinalAnswer(responseText, language),
      confidence: 85,
      source: 'huggingface'
    };
  }

  private async tryWebScraping(question: string, language: string): Promise<MathSolution | null> {
    try {
      const { webScraper } = await import('./webScraper.js');
      const result = await webScraper.scrapeMathSolution(question);
      return result;
    } catch (error) {
      console.error('Web scraping failed:', error);
      return null;
    }
  }

  private basicMathSolver(question: string, language: string): MathSolution {
    // Basic pattern matching for common math problems
    const steps: MathStep[] = [];

    // Check for limit problems
    if (question.toLowerCase().includes('limite') || question.toLowerCase().includes('limit')) {
      steps.push({
        title: language === 'fr' ? 'Identifier le type de limite' : 'تحديد نوع النهاية',
        description: language === 'fr' ? 'Analyser la forme de la fonction' : 'تحليل شكل الدالة',
        color: 'blue'
      });
    }

    // Check for derivative problems
    if (question.toLowerCase().includes('dérivée') || question.toLowerCase().includes('derivative')) {
      steps.push({
        title: language === 'fr' ? 'Appliquer les règles de dérivation' : 'تطبيق قواعد الاشتقاق',
        description: language === 'fr' ? 'Utiliser les formules de dérivation appropriées' : 'استخدام صيغ الاشتقاق المناسبة',
        color: 'green'
      });
    }

    if (steps.length === 0) {
      steps.push({
        title: language === 'fr' ? 'Analyse du problème' : 'تحليل المسألة',
        description: language === 'fr' ? 'Identifier les éléments clés du problème' : 'تحديد العناصر الأساسية للمسألة',
        color: 'blue'
      });
    }

    return {
      steps,
      finalAnswer: language === 'fr' ? 'Solution nécessite une analyse plus approfondie' : 'الحل يتطلب تحليل أعمق',
      confidence: 60,
      source: 'manual'
    };
  }

  private parseResponseIntoSteps(text: string, language: string): MathStep[] {
    const steps: MathStep[] = [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach((line, index) => {
      if (line.trim().length > 10) { // Only meaningful lines
        const colors: Array<'blue' | 'green' | 'purple' | 'amber'> = ['blue', 'green', 'purple', 'amber'];
        steps.push({
          title: language === 'fr' ? `Étape ${index + 1}` : `الخطوة ${index + 1}`,
          description: line.trim(),
          color: colors[index % colors.length]
        });
      }
    });

    return steps.length > 0 ? steps : [{
      title: language === 'fr' ? 'Solution' : 'الحل',
      description: text.trim() || (language === 'fr' ? 'Analyse en cours...' : 'جاري التحليل...'),
      color: 'blue'
    }];
  }

  private extractFinalAnswer(text: string, language: string): string {
    // Try to extract a final answer from the text
    const answerPatterns = {
      fr: /(?:réponse|résultat|solution)[:\s]*(.+?)(?:\n|$)/i,
      ar: /(?:الجواب|النتيجة|الحل)[:\s]*(.+?)(?:\n|$)/i,
    };

    const pattern = answerPatterns[language as keyof typeof answerPatterns] || answerPatterns.fr;
    const match = text.match(pattern);
    
    return match ? match[1].trim() : (language === 'fr' ? 'Voir solution détaillée ci-dessus' : 'انظر الحل المفصل أعلاه');
  }

  private getErrorSolution(language: string): MathSolution {
    return {
      steps: [{
        title: language === 'fr' ? 'Erreur de traitement' : 'خطأ في المعالجة',
        description: language === 'fr' 
          ? 'Impossible de traiter cette question pour le moment. Veuillez réessayer ou reformuler votre question.'
          : 'لا يمكن معالجة هذا السؤال حاليا. يرجى المحاولة مرة أخرى أو إعادة صياغة السؤال.',
        color: 'amber'
      }],
      finalAnswer: language === 'fr' ? 'Erreur de traitement' : 'خطأ في المعالجة',
      confidence: 0,
      source: 'manual'
    };
  }
}

export const mathSolver = new MathSolver();
