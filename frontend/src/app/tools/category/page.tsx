import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tool_count: number;
}

export const metadata: Metadata = {
  title: 'ツールカテゴリ一覧 | ToolRadar',
  description: 'MT4/MT5/TradingView対応の投資ツールをカテゴリ別に探せます。',
};

export default async function CategoryIndexPage() {
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  let categories: Category[] = [];
  
  try {
    const res = await fetch(`${apiUrl}/api/categories/`, {
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      const data = await res.json();
      categories = Array.isArray(data) ? data : (data.results || []);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">ホーム</Link></li>
          <li>/</li>
          <li><Link href="/tools" className="hover:text-foreground">ツール</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">カテゴリ</li>
        </ol>
      </nav>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ツールカテゴリ</h1>
        <p className="text-muted-foreground">目的別にツールを探せます</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(category => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/tools/category/${category.slug}`} className="hover:text-primary">
                  {category.name}
                </Link>
              </CardTitle>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{category.tool_count}件のツール</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>カテゴリがまだ登録されていません。</p>
        </div>
      )}
    </div>
  );
}
