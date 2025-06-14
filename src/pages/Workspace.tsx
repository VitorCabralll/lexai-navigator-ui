
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Workspace() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para criar o workspace
    console.log({ workspaceName, description, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Workspace</h1>
          <p className="text-muted-foreground">
            Configure um novo workspace para organizar seus projetos jurídicos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações do Workspace
              </CardTitle>
              <CardDescription>
                Defina as informações básicas do seu workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Nome do Workspace</Label>
                  <Input
                    id="workspace-name"
                    placeholder="Ex: Direito Empresarial"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresarial">Direito Empresarial</SelectItem>
                      <SelectItem value="civil">Direito Civil</SelectItem>
                      <SelectItem value="trabalhista">Direito Trabalhista</SelectItem>
                      <SelectItem value="tributario">Direito Tributário</SelectItem>
                      <SelectItem value="penal">Direito Penal</SelectItem>
                      <SelectItem value="administrativo">Direito Administrativo</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o propósito e escopo deste workspace..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Criar Workspace</Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/dashboard">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Nome do Workspace</h4>
                <p className="text-muted-foreground">
                  Escolha um nome descritivo que facilite a identificação do workspace.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Categorização</h4>
                <p className="text-muted-foreground">
                  A categoria ajuda a organizar e filtrar seus workspaces por área de atuação.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-muted-foreground">
                  Uma boa descrição ajuda outros membros da equipe a entenderem o propósito do workspace.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspaces Existentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Contratos Comerciais</h4>
                <p className="text-xs text-muted-foreground">Direito Empresarial</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Litígios Trabalhistas</h4>
                <p className="text-xs text-muted-foreground">Direito Trabalhista</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Consultoria Tributária</h4>
                <p className="text-xs text-muted-foreground">Direito Tributário</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
