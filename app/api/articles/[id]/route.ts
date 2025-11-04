import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUniqueSlug } from '@/lib/utils/slug-generator';

// GET single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get current user to determine permissions
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      isAdmin = profile?.role === 'admin';
    }

    // Check if user is attorney
    let isAttorneyOwner = false;
    if (user) {
      const { data: attorney } = await supabase
        .from('attorneys')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (attorney) {
        const { data: articleCheck } = await supabase
          .from('attorney_articles')
          .select('id')
          .eq('id', id)
          .eq('attorney_id', attorney.id)
          .single();
        
        isAttorneyOwner = !!articleCheck;
      }
    }

    // Build query - include attorney info, practice areas, and tags
    let query = supabase
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
      .eq('id', id);

    // If not admin or owner, only show published articles
    if (!isAdmin && !isAttorneyOwner) {
      query = query.eq('status', 'published');
    }

    const { data: article, error } = await query.single();

    if (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json(
        { error: 'Article not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article
    });

  } catch (error: any) {
    console.error('Error in GET /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';

    // Get attorney_id
    const { data: attorney } = await supabase
      .from('attorneys')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Check ownership or admin status
    const { data: existingArticle } = await supabase
      .from('attorney_articles')
      .select('attorney_id, status')
      .eq('id', id)
      .single();

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const isOwner = attorney && existingArticle.attorney_id === attorney.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to update this article' },
        { status: 403 }
      );
    }

    // If owner and article is published/rejected, create new pending version
    const body = await request.json();
    
    // Extract only fields that belong in attorney_articles table
    const { practice_area_ids, tags, ...articleFields } = body;
    
    let updateData: any = {
      ...articleFields
    };

    if (isOwner && !isAdmin && existingArticle.status !== 'draft') {
      // For attorneys editing published/rejected articles, create new pending version
      if (articleFields.title) {
        updateData.slug = articleFields.slug || generateUniqueSlug(articleFields.title);
      }
      updateData.status = 'pending_review';
    }

    // Update the article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('attorney_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json(
        { error: 'Failed to update article', details: updateError.message },
        { status: 500 }
      );
    }

    // Update practice areas if provided
    if (body.practice_area_ids) {
      // Delete existing links
      await supabase
        .from('article_practice_areas')
        .delete()
        .eq('article_id', id);

      // Insert new links
      if (body.practice_area_ids.length > 0) {
        const practiceAreaLinks = body.practice_area_ids.map(pa_id => ({
          article_id: id,
          practice_area_id: pa_id
        }));

        await supabase
          .from('article_practice_areas')
          .insert(practiceAreaLinks);
      }
    }

    // Update tags if provided
    if (body.tags) {
      // Delete existing links
      await supabase
        .from('article_tag_associations')
        .delete()
        .eq('article_id', id);

      // Get or create tags and link them
      if (body.tags.length > 0) {
        const tagLinks = await Promise.all(
          body.tags.map(async (tagName: string) => {
            const tagSlug = generateUniqueSlug(tagName);
            
            let { data: tag } = await supabase
              .from('article_tags')
              .select('id')
              .eq('slug', tagSlug)
              .single();

            if (!tag) {
              const { data: newTag } = await supabase
                .from('article_tags')
                .insert({ name: tagName, slug: tagSlug })
                .select()
                .single();
              tag = newTag;
            }

            return {
              article_id: id,
              tag_id: tag.id
            };
          })
        );

        await supabase
          .from('article_tag_associations')
          .insert(tagLinks);
      }
    }

    // Create revision record
    const { error: revError } = await supabase
      .from('article_revisions')
      .insert({
        article_id: id,
        title: updatedArticle.title,
        content: updatedArticle.content,
        excerpt: updatedArticle.excerpt,
        revised_by: user.id,
        revision_type: 'edited'
      });

    if (revError) {
      console.error('Error creating revision:', revError);
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle
    });

  } catch (error: any) {
    console.error('Error in PATCH /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';

    // Get attorney_id
    const { data: attorney } = await supabase
      .from('attorneys')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Check ownership
    const { data: existingArticle } = await supabase
      .from('attorney_articles')
      .select('attorney_id, status')
      .eq('id', id)
      .single();

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const isOwner = attorney && existingArticle.attorney_id === attorney.id;

    // Only allow deletion of draft articles by owner, or any article by admin
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this article' },
          { status: 403 }
        );
      }
      if (existingArticle.status !== 'draft') {
        return NextResponse.json(
          { error: 'Can only delete draft articles' },
          { status: 400 }
        );
      }
    }

    // Delete the article (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('attorney_articles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting article:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete article', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/articles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
