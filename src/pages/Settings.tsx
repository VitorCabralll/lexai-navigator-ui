
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Settings as SettingsIcon, User, Bell, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const { workspaces, selectedWorkspace, setSelectedWorkspace, getAgentsForWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e ambientes de trabalho
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Gerenciamento de Ambientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Ambientes de Trabalho</CardTitle>
            </div>
            <CardDescription>
              Gerencie seus ambientes e organize seus agentes por área jurídica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ambientes criados</p>
                <p className="text-sm text-muted-foreground">
                  Você tem {workspaces.length} ambiente(s) configurado(s)
                </p>
              </div>
              <Button asChild>
                <Link to="/workspace">
                  <Plus className="mr-2 h-4 w-4" />
                  Gerenciar Ambientes
                </Link>
              </Button>
            </div>
            
            {workspaces.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Ambiente ativo:</p>
                  {selectedWorkspace ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{selectedWorkspace.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getAgentsForWorkspace(selectedWorkspace.id).length} agente(s)
                          </p>
                        </div>
                      </div>
                      <Badge>Ativo</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum ambiente selecionado</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>Preferências do Sistema</CardTitle>
            </div>
            <CardDescription>
              Configure como o LexAI funciona para você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre conclusão de documentos
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Salvamento Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Salve automaticamente documentos em progresso
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Altere a aparência da interface
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Perfil Jurídico</CardTitle>
            </div>
            <CardDescription>
              Suas informações profissionais e áreas de atuação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Para alterar seu perfil jurídico, refaça o processo de configuração inicial.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/onboarding/legal-profile">
                  Atualizar Perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Todas as informações são criptografadas e mantidas em segurança conforme a LGPD.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
