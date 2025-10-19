import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "./editor-overrides.css";

export default function EditorPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <SimpleEditor />
    </div>
  );
}
