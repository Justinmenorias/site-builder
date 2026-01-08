import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import EditorPanel, { type ISelectedElement } from './EditorPanel';

interface ProjectReviewProps {
  project: Project;
  isGenerating: boolean;
  device?: 'desktop' | 'tablet' | 'phone';
  showEditorPanel?: boolean;
}

export interface ProjectPeviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPeviewRef, ProjectReviewProps>(
  (
    { project, isGenerating, device = 'desktop', showEditorPanel = true },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [selectedElement, setSelectedElement] =
      useState<ISelectedElement | null>(null);

    const reso = {
      phone: 'w-[412px]',
      tablet: 'w-[768px]',
      desktop: 'w-full',
    };

    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument;

        if (!doc) return undefined;

        doc
          .querySelectorAll('.ai-selected-element,[data-ai-selected]')
          .forEach((el) => {
            el.classList.remove('ai-selected-element');
            el.removeAttribute('data-ai-selected');
            (el as HTMLElement).style.outline = '';
          });

        const previewStyle = doc.getElementById('ai-preview-style');

        if (previewStyle) previewStyle.remove();

        const previewScript = doc.getElementById('ai-preview-script');

        if (previewScript) previewScript.remove();

        const html = doc.documentElement.outerHTML;

        return html;
      },
    }));

    const injectPreview = (html: string) => {
      if (!html) return '';

      if (!showEditorPanel) return html;

      if (html.includes('</body>')) {
        return html.replace('</body>', iframeScript + '</body>');
      } else {
        return html + iframeScript;
      }
    };

    const handleUpdate = (updates: unknown) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'UPDATE_ELEMENT',
            payload: updates,
          },
          '*'
        );
      }
    };

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'ELEMENT_SELECTED') {
          setSelectedElement(event.data.payload);
        } else if (event.data.type === 'CLEAR_SELECTION') {
          setSelectedElement(null);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
      <div className="relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2">
        {project.current_code ? (
          <>
            <iframe
              ref={iframeRef}
              srcDoc={injectPreview(project.current_code)}
              className={`h-full max-sm:w-full ${reso[device]} mx-auto transition-all`}
            />
            {showEditorPanel && selectedElement && (
              <EditorPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdate}
                onClose={() => {
                  setSelectedElement(null);
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      {
                        type: 'CLEAR_SELECTION_REQUEST',
                      },
                      '*'
                    );
                  }
                }}
              />
            )}
          </>
        ) : (
          isGenerating && <div>loading</div>
        )}
      </div>
    );
  }
);

export default ProjectPreview;
