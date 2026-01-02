import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download PDF report from audit results
 */
export async function generateAuditPDF(results) {
  try {
    const { totalScore, sectionScores, recommendations, leadInfo, websiteUrl, metadata } = results;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = 11, color = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * 7);
    };

    // Helper function to check and add new page
    const checkNewPage = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Header with company name
    pdf.setFontSize(24);
    pdf.setTextColor(255, 107, 53);
    pdf.text('GEO Readiness Audit Report', margin, yPosition);
    yPosition += 15;

    // Company and website info
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    if (leadInfo?.company) {
      yPosition = addWrappedText(`Company: ${leadInfo.company}`, margin, yPosition, contentWidth, 11, [50, 50, 50]);
    }
    if (websiteUrl) {
      yPosition = addWrappedText(`Website: ${websiteUrl}`, margin, yPosition, contentWidth, 11, [50, 50, 50]);
    }
    if (metadata?.duration) {
      yPosition = addWrappedText(`Audit Date: ${new Date().toLocaleDateString()}`, margin, yPosition, contentWidth, 11, [50, 50, 50]);
    }
    yPosition += 5;

    // Score section
    checkNewPage(40);
    pdf.setFontSize(16);
    pdf.setTextColor(255, 107, 53);
    pdf.text('Overall GEO Readiness Score', margin, yPosition);
    yPosition += 10;

    // Score circle representation
    pdf.setFontSize(36);
    pdf.setTextColor(255, 107, 53);
    pdf.text(`${totalScore}/100`, margin + 10, yPosition);
    yPosition += 20;

    // Score interpretation
    let scoreStatus = '';
    let statusColor = [255, 107, 53];
    if (totalScore >= 90) {
      scoreStatus = 'ELITE - Your website is highly optimized for GEO visibility';
      statusColor = [16, 185, 129];
    } else if (totalScore >= 60) {
      scoreStatus = 'AT RISK - Your website needs optimization for better GEO visibility';
      statusColor = [245, 158, 11];
    } else {
      scoreStatus = 'CRITICAL - Your website requires immediate GEO optimization';
      statusColor = [239, 68, 68];
    }
    yPosition = addWrappedText(scoreStatus, margin, yPosition, contentWidth, 12, statusColor);
    yPosition += 10;

    // Section Scores
    checkNewPage(50);
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Score Breakdown by Pillar', margin, yPosition);
    yPosition += 10;

    const sectionNames = {
      technical: 'Technical AI Access',
      structure: 'Content Extractability',
      authority: 'Entity Authority',
      freshness: 'Citation Health'
    };

    Object.entries(sectionScores).forEach(([key, data]) => {
      checkNewPage(15);
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      const percentage = Math.round((data.score / data.max) * 100);
      pdf.text(`${sectionNames[key]}: ${percentage}% (${data.score}/${data.max} points)`, margin, yPosition);
      yPosition += 8;
    });

    yPosition += 5;

    // Top Recommendations
    checkNewPage(60);
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Top Recommendations', margin, yPosition);
    yPosition += 10;

    const topRecommendations = recommendations.slice(0, 5);
    topRecommendations.forEach((rec, index) => {
      checkNewPage(20);
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      
      // Priority badge
      const priorityColor = rec.priority === 'high' ? [239, 68, 68] : rec.priority === 'medium' ? [245, 158, 11] : [16, 185, 129];
      pdf.setTextColor(...priorityColor);
      pdf.text(`[${rec.priority.toUpperCase()}]`, margin, yPosition);
      
      pdf.setTextColor(50, 50, 50);
      const questionText = pdf.splitTextToSize(`${index + 1}. ${rec.question}`, contentWidth - 20);
      pdf.text(questionText, margin + 15, yPosition);
      yPosition += (questionText.length * 5) + 2;
      
      const recommendationText = pdf.splitTextToSize(`→ ${rec.recommendation}`, contentWidth - 20);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(recommendationText, margin + 15, yPosition);
      yPosition += (recommendationText.length * 5) + 5;
    });

    // Footer
    yPosition += 10;
    checkNewPage(15);
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by Vserve GEO Readiness Audit™', margin, pageHeight - 10);
    pdf.text(`https://vservesolution.com`, margin, pageHeight - 5);

    // Download the PDF
    const fileName = `GEO-Audit-${leadInfo?.company || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
