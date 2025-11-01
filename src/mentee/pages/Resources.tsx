import { FileText, Link2, Briefcase, Download, FolderOpen, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Resources = () => {
  // This will be fetched from backend later
  const resources = {
    studyMaterials: [
      {
        id: 1,
        title: "Data Structures and Algorithms Guide",
        type: "pdf",
        size: "2.5 MB",
        uploadedAt: "2025-10-01",
        description: "Comprehensive guide covering basic to advanced DSA concepts",
        downloadUrl: "#"
      },
      {
        id: 2,
        title: "System Design Principles",
        type: "pdf",
        size: "4.1 MB",
        uploadedAt: "2025-09-28",
        description: "Best practices and patterns for scalable system design",
        downloadUrl: "#"
      }
    ],
    careerResources: [
      {
        id: 1,
        title: "Tech Interview Preparation Guide",
        type: "link",
        uploadedAt: "2025-10-02",
        description: "Curated list of resources for technical interviews",
        url: "https://example.com/interview-prep"
      },
      {
        id: 2,
        title: "Top Tech Companies Hiring Process",
        type: "document",
        size: "1.2 MB",
        uploadedAt: "2025-09-30",
        description: "Detailed breakdown of hiring processes at major tech companies",
        downloadUrl: "#"
      }
    ],
    internshipGuidelines: [
      {
        id: 1,
        title: "Summer Internship Opportunities 2026",
        type: "pdf",
        size: "1.8 MB",
        uploadedAt: "2025-10-03",
        description: "List of companies offering summer internships with application deadlines",
        downloadUrl: "#"
      },
      {
        id: 2,
        title: "Internship Application Tips",
        type: "link",
        uploadedAt: "2025-09-29",
        description: "Expert advice on crafting successful internship applications",
        url: "https://example.com/internship-tips"
      }
    ]
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "link":
        return <Link2 className="h-5 w-5 text-blue-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const ResourceCard = ({ title, icon, resources }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource: any) => (
          <div
            key={resource.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            {getResourceIcon(resource.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-base truncate">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                {resource.type === "link" ? (
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Link
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <a href={resource.downloadUrl} download>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {resource.size && (
                  <Badge variant="secondary" className="font-normal">
                    {resource.size}
                  </Badge>
                )}
                <Badge variant="secondary" className="font-normal">
                  Added {resource.uploadedAt}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Resources</h1>
        <p className="text-muted-foreground mt-2">Access study materials and resources shared by your mentor</p>
      </div>

      <div className="grid gap-6">
        <ResourceCard
          title="Study Materials"
          icon={<FolderOpen className="h-5 w-5 text-orange-500" />}
          resources={resources.studyMaterials}
        />
        <ResourceCard
          title="Career Resources"
          icon={<Briefcase className="h-5 w-5 text-purple-500" />}
          resources={resources.careerResources}
        />
        <ResourceCard
          title="Internship Guidelines"
          icon={<FileText className="h-5 w-5 text-green-500" />}
          resources={resources.internshipGuidelines}
        />
      </div>
    </div>
  );
};

export default Resources;
