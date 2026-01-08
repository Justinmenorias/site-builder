import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dummyProjects } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';

export default function Preview() {
  const { projectId } = useParams();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCode = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const code = dummyProjects.find(
        (project) => project.id === projectId
      )?.current_code;

      if (code) {
        setCode(code);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCode();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    );
  }

  return (
    <div className="h-screen">
      {code && (
        <ProjectPreview
          project={{ current_code: code } as Project}
          isGenerating={false}
          showEditorPanel={false}
        />
      )}
    </div>
  );
}
