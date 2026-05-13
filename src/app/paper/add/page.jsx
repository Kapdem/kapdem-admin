import AddPaper from "@/components/Paper/AddPaper";
import { getProfileData } from "@/lib/admin/data";

export default async function page() {
  const res = await getProfileData();

  return (
    <div>
      <AddPaper initialData={res.user.id} />
    </div>
  );
}
