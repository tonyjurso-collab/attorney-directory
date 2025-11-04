import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUniqueSlug } from '@/lib/utils/slug-generator';
import type { ArticleFormData, RevisionType } from '@/lib/types/articles';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an attorney
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'attorney') {
      return NextResponse.json(
        { error: 'Only attorneys can create articles' },
        { status: 403 }
      );
    }

    // Get attorney_id from user_id
    const { data: attorney, error: attorneyError } = await supabase
      .from('attorneys')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (attorneyError || !attorney) {
      return NextResponse.json(
        { error: 'Attorney profile not found' },
        { status: 404 }
      );
    }

    const body: ArticleFormData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const { data: existingArticles } = await supabase
      .from('attorney_articles')
      .select('slug');
    
    const existingSlugs = existingArticles?.map(a => a.slug) || [];
    const slug = generateUniqueSlug(body.title, existingSlugs);

    // Create the article
    const { data: article, error: articleError } = await supabase
      .from('attorney_articles')
      .insert({
        attorney_id: attorney.id,
        title: body.title,
        slug,
        content: body.content,
        excerpt: body.excerpt || null,
        meta_description: body.meta_description || null,
        status: 'draft'
      })
      .select()
      .single();

    if (articleError) {
      console.error('Error creating article:', articleError);
      return NextResponse.json(
        { error: 'Failed to create article', details: articleError.message },
        { status: 500 }
      );
    }

    // Link practice areas if provided
    if (body.practice_area_ids && body.practice_area_ids.length > 0) {
      const practiceAreaLinks = body.practice_area_ids.map(pa_id => ({
        article_id: article.id,
        practice_area_id: pa_id
      }));

      const { error: paError } = await supabase
        .from('article_practice_areas')
        .insert(practiceAreaLinks);

      if (paError) {
        console.error('Error linking practice areas:', paError);
      }
    }

    // Handle tags
    if (body.tags && body.tags.length > 0) {
      // Get or create tags
      const tagLinks = await Promise.all(
        body.tags.map(async (tagName) => {
          const tagSlug = generateUniqueSlug(tagName);
          
          // Check if tag exists
          let { data: tag } = await supabase
            .from('article_tags')
            .select('id')
            .eq('slug', tagSlug)
            .single();

          // Create tag if it doesn't exist
          if (!tag) {
            const { data: newTag } = await supabase
              .from('article_tags')
              .insert({ name: tagName, slug: tagSlug })
              .select()
              .single();
            tag = newTag;
          }

          return {
            article_id: article.id,
            tag_id: tag.id
          };
        })
      );

      const { error: tagError } = await supabase
        .from('article_tag_associations')
        .insert(tagLinks);

      if (tagError) {
        console.error('Error linking tags:', tagError);
      }
    }

    // Create initial revision
    const { error: revError } = await supabase
      .from('article_revisions')
      .insert({
        article_id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        revised_by: user.id,
        revision_type: 'created'
      });

    if (revError) {
      console.error('Error creating revision:', revError);
    }

    // Fetch the complete article with relations
    const { data: fullArticle } = await supabase
      .from('attorney_articles')
      .select(`
        *,
        attorney:attorneys!inner(
          id,
          first_name,
          last_name,
          firm_name,
          profile_image_url
        ),
        article_practice_areas(
          practice_area:practice_areas(
            id,
            name,
            slug,
            description
          )
        ),
        article_tag_associations(
          tag:article_tags(
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', article.id)
      .single();

    return NextResponse.json({
      success: true,
      article: fullArticle
    });

  } catch (error: any) {
    console.error('Error in POST /api/articles/create:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



