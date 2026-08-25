import { type BcObject } from "../../../types/blogcard";
import "../../../styles/components/Blog/BlogCard/BlogCard.css";
import CategorySection from "./CategorySection";

export default function BlogCard({ BcObject }: { BcObject: BcObject }) {
  const {
    title,
    author,
    date,
    img,
    categoryList,
    slug,
    readMinutes,
  } = BcObject.data;

  return (
    <article aria-label={`Article Card titled ${title}`} className="blog-card">
      <a aria-label="" href={"/blog/" + slug} className="bc-img">
        <img src={img} alt={`Cover image for article`} className="bc-img" />
      </a>
      <section className="text-section">
        <a href={"/blog/" + slug} className="bc-title">
          <h2>{title}</h2>
        </a>
        <section className="bc-bottom">
          <span>
            by{" "}
            <a className="hov-ul">
              {author}
            </a>
          </span>
          <span>• {date}</span>
          {readMinutes && <span>• {readMinutes} Minutes</span>}
        </section>
        <CategorySection categoryList={categoryList} />
      </section>
    </article>
  );
}
