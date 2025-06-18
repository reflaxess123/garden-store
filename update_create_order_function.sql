CREATE OR REPLACE FUNCTION public.create_order(
  p_address text,
  p_city text,
  p_email text,
  p_full_name text,
  p_order_items jsonb,
  p_phone text,
  p_postal_code text,
  p_total_amount numeric,
  p_user_id uuid
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_id uuid := gen_random_uuid();
  item jsonb;
BEGIN
  INSERT INTO public.orders (
    id, address, city, email, "fullName", phone, "postalCode", "totalAmount", "userId"
  ) VALUES (
    new_order_id, p_address, p_city, p_email, p_full_name, p_phone, p_postal_code, p_total_amount, p_user_id
  );

  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO public.order_items (
      "orderId",
      "productId",
      quantity,
      "priceSnapshot",
      name,
      "imageUrl"
    ) VALUES (
      new_order_id,
      (item->>'productId')::uuid,
      (item->>'quantity')::integer,
      (item->>'priceSnapshot')::numeric,
      item->>'name',
      item->>'imageUrl'
    );

    -- Увеличиваем счетчик timesOrdered для каждого продукта
    UPDATE public.products
    SET "timesOrdered" = "timesOrdered" + (item->>'quantity')::integer
    WHERE id = (item->>'productId')::uuid;
  END LOOP;

  RETURN new_order_id;
END;
$$; 