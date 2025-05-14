import { PDFOptions } from '@/lib/types';

interface PDFPreviewProps {
  options: PDFOptions;
}

export default function PDFPreview({ options }: PDFPreviewProps) {
  return (
    <div className="min-h-[300px] bg-white font-serif text-[10px] text-black">
      {/* Sample PDF preview content */}
      <div className="p-4">
        {options.includeHeader && (
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-[16px] font-bold mb-1">ABC CBSE School</h1>
            <h2 className="text-[14px] font-semibold mb-1">Physics Chapter Test: Motion in a Straight Line</h2>
            <div className="text-[10px]">
              <div>Subject: Physics</div>
              <div>Chapter: Motion in a Straight Line</div>
              <div>Duration: 60 minutes</div>
              <div>Total Marks: 25</div>
              <div>Teacher: John Smith</div>
            </div>
          </div>
        )}
        
        {options.includeInstructions && (
          <div className="bg-gray-50 p-2 mb-6 border border-gray-200">
            <h3 className="font-bold mb-1">Instructions:</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>All questions are compulsory.</li>
              <li>Write your answers clearly and legibly.</li>
              {options.showMarks && <li>Marks are indicated against each question.</li>}
              <li>Do not use calculators or mobile phones during the test.</li>
            </ul>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="question">
            <div className="flex justify-between items-start">
              <span className="font-bold">Q1.</span>
              {options.showMarks && <span className="italic">(2 marks)</span>}
            </div>
            <div>Define instantaneous velocity. How is it different from average velocity?</div>
            <div className="mt-3 space-y-2">
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
            </div>
          </div>
          
          <div className="question">
            <div className="flex justify-between items-start">
              <span className="font-bold">Q2.</span>
              {options.showMarks && <span className="italic">(1 mark)</span>}
            </div>
            <div>Which of the following best describes acceleration?</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1">
                <span>A)</span> 
                <span>The rate of change of displacement</span>
              </div>
              <div className="flex items-center gap-1">
                <span>B)</span> 
                <span>The rate of change of velocity</span>
              </div>
              <div className="flex items-center gap-1">
                <span>C)</span> 
                <span>The rate of change of distance</span>
              </div>
              <div className="flex items-center gap-1">
                <span>D)</span> 
                <span>The rate of change of speed</span>
              </div>
            </div>
          </div>
          
          <div className="question">
            <div className="flex justify-between items-start">
              <span className="font-bold">Q3.</span>
              {options.showMarks && <span className="italic">(3 marks)</span>}
            </div>
            <div>A car accelerates uniformly from rest to a speed of 20 m/s in 10 seconds. Calculate the acceleration and the distance traveled.</div>
            <div className="mt-3 space-y-2">
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
              <div className="border-b border-gray-300 h-[1.5em]"></div>
            </div>
          </div>
        </div>
        
        {options.includeAnswers && (
          <div className="mt-12 pt-3 border-t">
            <h3 className="font-bold mb-2">Answer Key:</h3>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Instantaneous velocity is the velocity of an object at a specific point in time. It differs from average velocity as it considers velocity at a single moment rather than over a period of time.</li>
              <li>B) The rate of change of velocity</li>
              <li>Acceleration = Δv/Δt = 20/10 = 2 m/s². Distance = ½ × a × t² = 0.5 × 2 × 10² = 100 meters.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}