// 或者你实际放上传组件的页面路径
import CardUploader from '@/components/upload/CardUploader';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Upload Business Card</h1>
      <CardUploader />
    </div>
  );
}