import "../../../styles/components/Blog/BlogCard/category-section.css";

export default function CategorySection({
  categoryList,
}: {
  categoryList: string[];
}) {
  const getLink = (i: string) => `/category/${i.replaceAll(/\s+/gi, "-")}`;
  return (
    <ul aria-label="Genre List" className="category-section">
      {categoryList.map((i, idx) => (
        <li key={idx} className="category-span">
          <a href={getLink(i)} key={idx} >
            {i}
          </a>
        </li>
      ))}
    </ul>
  );
}
//
