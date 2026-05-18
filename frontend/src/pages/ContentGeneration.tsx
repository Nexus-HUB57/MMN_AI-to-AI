import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function ContentGeneration() {
  const { user, loading: authLoading } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate Text State
  const [textPlatform, setTextPlatform] = useState<"instagram" | "facebook" | "whatsapp">("instagram");
  const [textTopic, setTextTopic] = useState("");
  const [textTone, setTextTone] = useState<"professional" | "casual" | "persuasive" | "humorous">("professional");
  const [textMaxLength, setTextMaxLength] = useState(280);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  // Generate Variations State
  const [varPlatform, setVarPlatform] = useState<"instagram" | "facebook" | "whatsapp">("instagram");
  const [varTopic, setVarTopic] = useState("");
  const [varCount, setVarCount] = useState(3);
  const [variations, setVariations] = useState<any[]>([]);

  // Hashtags State
  const [hashtagTopic, setHashtagTopic] = useState("");
  const [hashtagPlatform, setHashtagPlatform] = useState<"instagram" | "facebook" | "whatsapp">("instagram");
  const [hashtagCount, setHashtagCount] = useState(10);
  const [hashtags, setHashtags] = useState<string[]>([]);

  // Sentiment Analysis State
  const [sentimentContent, setSentimentContent] = useState("");
  const [sentimentResult, setSentimentResult] = useState<any>(null);

  // Product Description State
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productFeatures, setProductFeatures] = useState("");
  const [productAudience, setProductAudience] = useState("");
  const [productPlatform, setProductPlatform] = useState<"instagram" | "facebook" | "whatsapp">("instagram");
  const [productDescription, setProductDescription] = useState<string | null>(null);

  // Image Generation State (Coming Soon)
  const [imagePrompt, setImagePrompt] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageSectionEnabled, setImageSectionEnabled] = useState(false); // Disabled until backend supports it

  // Mutations
  const { mutate: generateText, isPending: textLoading } = trpc.content.generateText.useMutation({
    onSuccess: (result) => {
      setGeneratedText(result.content);
      toast.success("Text generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate text");
    },
  });

  const { mutate: generateVariations, isPending: varLoading } = trpc.content.generateVariations.useMutation({
    onSuccess: (result) => {
      setVariations(result.variations);
      toast.success("Variations generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate variations");
    },
  });

  const { mutate: generateHashtags, isPending: hashtagLoading } = trpc.content.generateHashtags.useMutation({
    onSuccess: (result) => {
      setHashtags(result.hashtags);
      toast.success("Hashtags generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate hashtags");
    },
  });

  const { mutate: analyzeSentiment, isPending: sentimentLoading } = trpc.content.analyzeSentiment.useMutation({
    onSuccess: (result) => {
      setSentimentResult(result);
      toast.success("Sentiment analyzed successfully");
    },
    onError: () => {
      toast.error("Failed to analyze sentiment");
    },
  });

  const { mutate: generateProductDesc, isPending: productLoading } = trpc.content.generateProductDescription.useMutation({
    onSuccess: (result) => {
      setProductDescription(typeof result.description === 'string' ? result.description : null);
      toast.success("Product description generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate product description");
    },
  });

  // Note: trpc.content.generateImage is not implemented in backend yet
  // The image generation feature is marked as "Coming Soon"

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to generate content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sentimentColors = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Content Generation</h1>
        <p className="text-gray-600">Generate AI-powered content for your social media and marketing</p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
        </TabsList>

        {/* Generate Text Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Optimized Text</CardTitle>
              <CardDescription>Create platform-specific content with AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="text-platform">Platform</Label>
                  <Select value={textPlatform} onValueChange={(value: any) => setTextPlatform(value)}>
                    <SelectTrigger id="text-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-tone">Tone</Label>
                  <Select value={textTone} onValueChange={(value: any) => setTextTone(value)}>
                    <SelectTrigger id="text-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-topic">Topic</Label>
                <Input
                  id="text-topic"
                  value={textTopic}
                  onChange={(e) => setTextTopic(e.target.value)}
                  placeholder="What would you like to write about?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-length">Max Length: {textMaxLength} characters</Label>
                <input
                  id="text-length"
                  type="range"
                  min="50"
                  max="500"
                  value={textMaxLength}
                  onChange={(e) => setTextMaxLength(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button
                onClick={() => generateText({ platform: textPlatform, topic: textTopic, tone: textTone, maxLength: textMaxLength })}
                disabled={textLoading || !textTopic}
                className="w-full"
              >
                {textLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Text
                  </>
                )}
              </Button>

              {generatedText && (
                <Card className="bg-blue-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">Generated Content:</p>
                    <p className="text-sm mb-4">{generatedText}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedText, "text")}
                      className="w-full"
                    >
                      {copiedId === "text" ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Variations Tab */}
        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Content Variations</CardTitle>
              <CardDescription>Create multiple versions with different tones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="var-platform">Platform</Label>
                  <Select value={varPlatform} onValueChange={(value: any) => setVarPlatform(value)}>
                    <SelectTrigger id="var-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="var-count">Number of Variations</Label>
                  <Select value={varCount.toString()} onValueChange={(value) => setVarCount(Number(value))}>
                    <SelectTrigger id="var-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="var-topic">Topic</Label>
                <Input
                  id="var-topic"
                  value={varTopic}
                  onChange={(e) => setVarTopic(e.target.value)}
                  placeholder="Enter topic for variations"
                />
              </div>

              <Button
                onClick={() => generateVariations({ platform: varPlatform, topic: varTopic, count: varCount })}
                disabled={varLoading || !varTopic}
                className="w-full"
              >
                {varLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Variations
                  </>
                )}
              </Button>

              {variations.length > 0 && (
                <div className="space-y-3">
                  {variations.map((variation, index) => (
                    <Card key={index} className="bg-purple-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Variation {variation.variation} - {variation.tone}</p>
                          <Badge variant="secondary">{variation.tone}</Badge>
                        </div>
                        <p className="text-sm mb-3">{variation.content}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(variation.content, `var-${index}`)}
                          className="w-full"
                        >
                          {copiedId === `var-${index}` ? "Copied!" : "Copy"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Hashtags</CardTitle>
              <CardDescription>Create relevant hashtags for your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hashtag-platform">Platform</Label>
                  <Select value={hashtagPlatform} onValueChange={(value: any) => setHashtagPlatform(value)}>
                    <SelectTrigger id="hashtag-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hashtag-count">Number of Hashtags</Label>
                  <Select value={hashtagCount.toString()} onValueChange={(value) => setHashtagCount(Number(value))}>
                    <SelectTrigger id="hashtag-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtag-topic">Topic</Label>
                <Input
                  id="hashtag-topic"
                  value={hashtagTopic}
                  onChange={(e) => setHashtagTopic(e.target.value)}
                  placeholder="Enter topic for hashtags"
                />
              </div>

              <Button
                onClick={() => generateHashtags({ topic: hashtagTopic, platform: hashtagPlatform, count: hashtagCount })}
                disabled={hashtagLoading || !hashtagTopic}
                className="w-full"
              >
                {hashtagLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Hashtags
                  </>
                )}
              </Button>

              {hashtags.length > 0 && (
                <Card className="bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(hashtags.join(" "), "hashtags")}
                      className="w-full"
                    >
                      {copiedId === "hashtags" ? "Copied!" : "Copy All"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Sentiment</CardTitle>
              <CardDescription>Understand the emotional tone of your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sentiment-content">Content to Analyze</Label>
                <Textarea
                  id="sentiment-content"
                  value={sentimentContent}
                  onChange={(e) => setSentimentContent(e.target.value)}
                  placeholder="Enter text to analyze sentiment"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => analyzeSentiment({ content: sentimentContent })}
                disabled={sentimentLoading || !sentimentContent}
                className="w-full"
              >
                {sentimentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Sentiment
                  </>
                )}
              </Button>

              {sentimentResult && (
                <Card className="bg-yellow-50">
                  <CardContent className="pt-6 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sentiment</p>
                      <Badge className={sentimentColors[sentimentResult.sentiment as keyof typeof sentimentColors]}>
                        {sentimentResult.sentiment.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Score</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${sentimentResult.score}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium mt-1">{sentimentResult.score}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Explanation</p>
                      <p className="text-sm">{sentimentResult.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Description Tab */}
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Product Description</CardTitle>
              <CardDescription>Create compelling product descriptions for sales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Input
                    id="product-category"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="e.g., Electronics"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-features">Features (comma-separated)</Label>
                <Input
                  id="product-features"
                  value={productFeatures}
                  onChange={(e) => setProductFeatures(e.target.value)}
                  placeholder="e.g., Wireless, Waterproof, Long Battery"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-audience">Target Audience</Label>
                <Input
                  id="product-audience"
                  value={productAudience}
                  onChange={(e) => setProductAudience(e.target.value)}
                  placeholder="e.g., Tech enthusiasts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-platform">Platform</Label>
                <Select value={productPlatform} onValueChange={(value: any) => setProductPlatform(value)}>
                  <SelectTrigger id="product-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() =>
                  generateProductDesc({
                    productName,
                    productCategory,
                    features: productFeatures.split(",").map((f) => f.trim()),
                    targetAudience: productAudience,
                    platform: productPlatform,
                  })
                }
                disabled={productLoading || !productName || !productCategory}
                className="w-full"
              >
                {productLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Description
                  </>
                )}
              </Button>

              {productDescription && (
                <Card className="bg-orange-50">
                  <CardContent className="pt-6">
                    <p className="text-sm mb-4">{productDescription}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(productDescription, "product")}
                      className="w-full"
                    >
                      {copiedId === "product" ? "Copied!" : "Copy"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Generation Section - Coming Soon */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Generate Promotional Images
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>Create AI-powered images for your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Image Description</Label>
            <Textarea
              id="image-prompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={3}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="original-image">Original Image URL (optional)</Label>
            <Input
              id="original-image"
              value={originalImageUrl}
              onChange={(e) => setOriginalImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled
            />
            <p className="text-xs text-gray-500">Use this to edit an existing image</p>
          </div>

          <Button
            disabled
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Generate Image - Coming Soon
          </Button>

          <p className="text-sm text-gray-500 text-center py-4">
            Image generation will be available soon. Stay tuned for updates!
          </p>

          {generatedImageUrl && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <img src={generatedImageUrl} alt="Generated" className="w-full rounded-lg mb-4" />
                <a href={generatedImageUrl} download className="block">
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
