import { getAllCategories } from "@/services/category.service";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="text-sm text-muted-foreground">{categories.length} categories</p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Kind</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={String(cat._id)} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{cat.slug}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{cat.kind}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{cat.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
