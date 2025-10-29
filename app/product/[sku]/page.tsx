'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  stacklineSku: string;
  title: string;
  categoryName: string;
  subCategoryName: string;
  imageUrls?: string[];
  featureBullets?: string[];
  retailerSku: string;
}

export default function ProductPage() {
  const params = useParams<{ sku?: string }>();
  const sku = useMemo(() => params?.sku ?? null, [params]);

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sku) {
      setProduct(null);
      setError("No product selected");
      return;
    }

    const controller = new AbortController();

    async function loadProduct() {
      setProduct(undefined);
      setError(null);
      setSelectedImage(0);

      try {
        const res = await fetch(`/api/products/${sku}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Product not found");
        }

        const data = (await res.json()) as Product;
        setProduct(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setProduct(null);
        setError("Unable to load product");
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [sku]);

  const images = useMemo(
    () => product?.imageUrls?.filter((url): url is string => Boolean(url)) ?? [],
    [product?.imageUrls]
  );
  const imageCount = images.length;

  useEffect(() => {
    setSelectedImage(0);
  }, [imageCount]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Loading product...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              {error ?? "Product not found"}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedImage] ?? null;
  const featureBullets = product.featureBullets ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-96 w-full bg-muted">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={product.title}
                      fill
                      className="object-contain p-8"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === idx ? "border-primary" : "border-muted"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.title} - Image ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant="secondary">{product.categoryName}</Badge>
                <Badge variant="outline">{product.subCategoryName}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-sm text-muted-foreground">
                SKU: {product.retailerSku}
              </p>
            </div>

            {featureBullets.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-3">Features</h2>
                  <ul className="space-y-2">
                    {featureBullets.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
