interface ContentSectionProps {
  category: string;
  subcategory?: string;
  state: string;
}

export function ContentSection({ category, subcategory, state }: ContentSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4">
        About {subcategory || category} Law in {state}
      </h2>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          If you've been injured or need legal assistance with {subcategory || category} matters in {state}, 
          it's important to understand your rights and options.
        </p>
        <h3 className="text-xl font-semibold mb-2">Why You Need an Attorney</h3>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Navigate complex legal procedures</li>
          <li>Maximize your compensation</li>
          <li>Protect your rights</li>
          <li>Handle insurance companies</li>
        </ul>
        <h3 className="text-xl font-semibold mb-2">How We Can Help</h3>
        <p className="text-gray-700">
          Our network of experienced {subcategory || category} attorneys in {state} can provide 
          you with the legal representation you need. Get started by answering a few questions above.
        </p>
      </div>
    </div>
  );
}
