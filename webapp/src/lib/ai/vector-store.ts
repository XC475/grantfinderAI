import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
});

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export interface GrantMetadata {
  opportunity_id: number;
  source: string;
  source_grant_id: string | null;
  status: string;
  title: string;
  agency: string | null;
  category: string[] | null;
  funding_instrument: string | null;
  state_code: string | null;
  fiscal_year: number | null;
  total_funding_amount: number | null;
  award_min: number | null;
  award_max: number | null;
  cost_sharing: boolean | null;
  post_date: string | null;
  close_date: string | null;
  url: string | null;
  content_hash: string;
  vectorized_at: string;
  model: string;
  source_field: string;
}

export interface GrantDocument {
  content: string;
  metadata: GrantMetadata;
}

export async function searchGrants(
  query: string,
  filters?: {
    stateCode?: string;
    status?: string;
    category?: string;
  }
): Promise<GrantDocument[]> {
  try {
    // Create vector store instance
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });

    // Build metadata filter for Supabase
    // Note: SupabaseVectorStore expects metadata fields without the metadata prefix
    const filter: Record<string, any> = {};

    if (filters?.stateCode) {
      filter.state_code = filters.stateCode;
    }
    if (filters?.status) {
      filter.status = filters.status;
    }
    if (filters?.category) {
      // For array fields, we'd need custom SQL, so we'll filter post-search
      // Or we can try to use the filter syntax that Supabase supports
    }

    console.log("🔍 Searching grants with query:", query);
    console.log("📋 Filters:", filters);

    // Perform similarity search
    const results = await vectorStore.similaritySearch(
      query,
      10, // top 10 results
      filter
    );

    console.log(`✅ Found ${results.length} grants`);

    // Format results
    return results.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata as GrantMetadata,
    }));
  } catch (error) {
    console.error("❌ Error searching grants:", error);
    throw new Error(
      `Failed to search grants: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
