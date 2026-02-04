
"use client";

import { useRouter } from 'next/navigation';
import { AssessmentPlayer } from './AssessmentPlayer';
import { Assessment, Submission } from '@/types/assessment';

interface WrapperProps {
    assessment: Assessment;
    existingSubmission?: Submission;
}

export const ExamExitWrapper = ({ assessment, existingSubmission }: WrapperProps) => {
    const router = useRouter();

    const handleExit = () => {
        // Refresh to show the "Completed" state handled by the server component
        router.refresh();
        // Or navigate to a specific results page if we had one
        // router.push('/portal'); 
    };

    return (
        <AssessmentPlayer
            assessment={assessment}
            existingSubmission={existingSubmission}
            onExit={handleExit}
        />
    );
};
