
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";

interface ExportButtonsProps {
  content: string;
  filename: string;
}

export function ExportButtons({ content, filename }: ExportButtonsProps) {
  const exportAsDocx = async () => {
    try {
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
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar DOCX:', error);
    }
  };

  const exportAsPdf = () => {
    try {
      const pdf = new jsPDF();
      const lines = content.split('\n');
      const pageHeight = pdf.internal.pageSize.height;
      let y = 20;

      lines.forEach(line => {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 10, y);
        y += 7;
      });

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
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
