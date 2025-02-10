import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  let filter = {};
  if (search) {
    filter = { username: { $regex: search, $options: 'i' } };
  }

  try {
    const users = await UserModel.find(filter).select('username');
    return new Response(JSON.stringify({ success: true, users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to fetch users' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
