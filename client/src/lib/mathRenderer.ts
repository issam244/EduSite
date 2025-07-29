// Math rendering utilities for LaTeX and mathematical expressions

export interface RenderedMathStep {
  title: string;
  className: string;
  math?: string;
}

export const renderMathStep = (step: any, index: number): RenderedMathStep => {
  const colors = {
    blue: 'bg-blue-50 border-l-4 border-blue-400',
    green: 'bg-green-50 border-l-4 border-green-400',
    purple: 'bg-purple-50 border-l-4 border-purple-400',
    amber: 'bg-amber-50 border-l-4 border-amber-400'
  };

  return {
    title: `Étape ${index + 1}: ${step.title || step.step}`,
    className: colors[step.color as keyof typeof colors] || colors.blue,
    math: step.math
  };
};

export const renderLatex = (latex: string): string => {
  // In a full implementation, this would use MathJax or KaTeX
  // For now, return the LaTeX as-is for display
  return latex;
};

export const formatMathExpression = (expression: string): string => {
  // Basic math expression formatting
  return expression
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×')
    .replace(/sqrt\((.*?)\)/g, '√($1)')
    .replace(/pi/g, 'π')
    .replace(/alpha/g, 'α')
    .replace(/beta/g, 'β')
    .replace(/gamma/g, 'γ')
    .replace(/delta/g, 'δ')
    .replace(/epsilon/g, 'ε')
    .replace(/theta/g, 'θ')
    .replace(/lambda/g, 'λ')
    .replace(/mu/g, 'μ')
    .replace(/sigma/g, 'σ')
    .replace(/phi/g, 'φ')
    .replace(/omega/g, 'ω');
};

export const formatMathText = (text: string): string => {
  // Format mathematical text for display
  // Replace mathematical expressions with formatted versions
  return text
    .replace(/\*\*/g, '<sup>')
    .replace(/\^([0-9]+)/g, '<sup>$1</sup>')
    .replace(/\*/g, '×')
    .replace(/sqrt\((.*?)\)/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="fraction">$1/$2</span>')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\\\/g, '<br>')
    .replace(/\n/g, '<br>');
};