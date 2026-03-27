// src/context/TestContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Define the shape of our state based on your backend schemas
interface TestMetadata {
  _id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
}

interface BlueprintItem {
  question_number: number;
  topic: string;
  Question_Type: string;
  Style: string;
  marks: number;
}

export interface LayoutItem {
  id: string; // A temporary UI id (like a UUID) for React keys
  itemType: 'Question' | 'StaticAsset' | 'BlankPage';
  itemId?: string; // The database ObjectId
  itemModel?: 'MCQ' | 'StructuredQuestion' | 'StaticAsset';
  title: string; // For display in the sidebar (e.g., "Question 1", "Cover Page")
}

interface TestContextType {
  testMetadata: TestMetadata | null;
  setTestMetadata: (meta: TestMetadata) => void;
  activeVersionId: string | null;
  setActiveVersionId: (id: string) => void;
  blueprint: BlueprintItem[];
  setBlueprint: (blueprint: BlueprintItem[]) => void;
  budgetMismatch: boolean;
  setBudgetMismatch: (mismatch: boolean) => void;
  layout: LayoutItem[];
  setLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [testMetadata, setTestMetadata] = useState<TestMetadata | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<BlueprintItem[]>([]);
  const [budgetMismatch, setBudgetMismatch] = useState<boolean>(false);
  const [layout, setLayout] = useState<LayoutItem[]>([]);

  return (
    <TestContext.Provider 
      value={{ 
        testMetadata, setTestMetadata, 
        activeVersionId, setActiveVersionId, 
        blueprint, setBlueprint,
        budgetMismatch, setBudgetMismatch,
        layout, setLayout,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
};