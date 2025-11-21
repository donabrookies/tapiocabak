const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Listar pedidos
    if (req.method === 'GET') {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = orders.map(order => ({
        ...order,
        items: order.order_items.map(item => ({
          product: item.products,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      }));

      return res.status(200).json(formattedOrders);
    }

    // POST - Criar pedido
    if (req.method === 'POST') {
      const { customer_name, customer_phone, total_amount, payment_method, notes, items } = req.body;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          { 
            customer_name, 
            customer_phone, 
            total_amount, 
            payment_method, 
            notes,
            status: 'pendente'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return res.status(201).json(order);
    }

    // PUT - Atualizar pedido
    if (req.method === 'PUT') {
      const { id, status } = req.body;

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};