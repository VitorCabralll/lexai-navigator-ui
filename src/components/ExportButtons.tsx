
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ExportButtonsProps {
  content: string;
  filename: string;
}

export function ExportButtons({ content, filename }: ExportButtonsProps) {
  const { toast } = useToast();

  const exportAsDocx = async () => {
    try {
      // Dynamic import to avoid build issues
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: content.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line || " ")],
            })
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Documento exportado como DOCX",
      });
    } catch (error) {
      console.error('Erro ao exportar DOCX:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar documento DOCX",
        variant: "destructive",
      });
    }
  };

  const exportAsPdf = async () => {
    try {
      // Dynamic import to avoid build issues
      const { default: jsPDF } = await import("jspdf");
      
      const pdf = new jsPDF();
      const lines = content.split('\n');
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 7;
      const margin = 20;
      let y = margin;

      lines.forEach(line => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        
        // Handle long lines by wrapping text
        const maxWidth = pdf.internal.pageSize.width - (margin * 2);
        const splitText = pdf.splitTextToSize(line || " ", maxWidth);
        
        splitText.forEach((textLine: string) => {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(textLine, margin, y);
          y += lineHeight;
        });
      });

      pdf.save(`${filename}.pdf`);

      toast({
        title: "Sucesso",
        description: "Documento exportado como PDF",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar documento PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={exportAsDocx}>
        <Download className="h-3 w-3 mr-1" />
        DOCX
      </Button>
      <Button size="sm" variant="outline" onClick={exportAsPdf}>
        <Download className="h-3 w-3 mr-1" />
        PDF
      </Button>
    </div>
  );
}
