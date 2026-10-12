/** Explicit projections keep newly added database columns out of public responses. */
export const PUBLIC_COURSE_COLUMNS =
  "id,title,subtitle,slug,description,cover_image_url,image_url,thumbnail_url,instructor_name,instructor_title,workload_minutes,duration_label,level,category,is_published,status,content_revision,billing_type,pix_price_cents,total_price_cents,installment_count,stripe_price_id,stripe_product_id,tags,details,team,stats,community_enabled,certificate_rules,legacy_payload,created_at,updated_at,course_mediators(mediator:mediators(id,name,role,image,bio))";
export const PUBLIC_POST_COLUMNS =
  "id,title,slug,subtitle,excerpt,content,type,image_url,external_url,pdf_url,tags,is_published,published_at,legacy_payload,created_at,updated_at";
export const PUBLIC_GALLERY_COLUMNS =
  "id,image_url,title,caption,tags,width,height,is_published,legacy_payload,created_at,updated_at";
export const PUBLIC_TEAM_COLUMNS =
  "id,name,role,bio,image_url,sort_order,is_published,legacy_payload,created_at,updated_at";
