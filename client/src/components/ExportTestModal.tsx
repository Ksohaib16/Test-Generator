import { useState } from 'react';
import { Test, PDFOptions } from '@/lib/types';
import { useExportTestPDF } from '@/hooks/use-test-data';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download } from 'lucide-react';
import PDFPreview from './PDFPreview';

interface ExportTestModalProps {
  test: Test;
  open: boolean;
  onClose: () => void;
}

export default function ExportTestModal({ test, open, onClose }: ExportTestModalProps) {
  const { toast } = useToast();
  const exportPDFMutation = useExportTestPDF(test.id.toString());
  
  const [pdfOptions, setPdfOptions] = useState<PDFOptions>({
    includeHeader: true,
    includeInstructions: true,
    showMarks: true,
    includeAnswers: false,
  });
  
  const handleToggleOption = (option: keyof PDFOptions) => {
    setPdfOptions({
      ...pdfOptions,
      [option]: !pdfOptions[option],
    });
  };
  
  const handleExport = async () => {
    try {
      const result = await exportPDFMutation.mutateAsync(pdfOptions);
      
      // In a real app, this would download the PDF file
      toast({
        title: 'PDF Exported',
        description: 'The test has been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Export Test</DialogTitle>
          <DialogDescription>
            Export "{test.title}" as PDF
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="mt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="h-[400px] overflow-auto border rounded-md p-4">
            <PDFPreview options={pdfOptions} />
          </TabsContent>
          
          <TabsContent value="options">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-header">Include Header</Label>
                  <p className="text-sm text-muted-foreground">
                    Add institution name, test title, and other information at the top
                  </p>
                </div>
                <Switch
                  id="include-header"
                  checked={pdfOptions.includeHeader}
                  onCheckedChange={() => handleToggleOption('includeHeader')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-instructions">Include Instructions</Label>
                  <p className="text-sm text-muted-foreground">
                    Include standard instructions for students
                  </p>
                </div>
                <Switch
                  id="include-instructions"
                  checked={pdfOptions.includeInstructions}
                  onCheckedChange={() => handleToggleOption('includeInstructions')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-marks">Show Marks</Label>
                  <p className="text-sm text-muted-foreground">
                    Display marks for each question
                  </p>
                </div>
                <Switch
                  id="show-marks"
                  checked={pdfOptions.showMarks}
                  onCheckedChange={() => handleToggleOption('showMarks')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-answers">Include Answer Key</Label>
                  <p className="text-sm text-muted-foreground">
                    Include an answer key at the end of the test
                  </p>
                </div>
                <Switch
                  id="include-answers"
                  checked={pdfOptions.includeAnswers}
                  onCheckedChange={() => handleToggleOption('includeAnswers')}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportPDFMutation.isPending}
          >
            {exportPDFMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}