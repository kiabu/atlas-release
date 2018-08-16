/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.atlas.model.impexp;


import org.apache.atlas.model.instance.AtlasEntity;
import org.apache.atlas.model.typedef.AtlasBaseTypeDef;
import org.apache.atlas.model.typedef.AtlasTypesDef;
import org.codehaus.jackson.annotate.JsonAutoDetect;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.map.annotate.JsonSerialize;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.PUBLIC_ONLY;


@JsonAutoDetect(getterVisibility=PUBLIC_ONLY, setterVisibility=PUBLIC_ONLY, fieldVisibility=NONE)
@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown=true)
@XmlRootElement
@XmlAccessorType(XmlAccessType.PROPERTY)
public class AtlasExportResult implements Serializable {
    private static final long serialVersionUID = 1L;

    public final static String ENTITY_COUNT = "entityCount";

    public enum OperationStatus {
        SUCCESS, PARTIAL_SUCCESS, FAIL
    }

    private AtlasExportRequest   request;
    private String               userName;
    private String               clientIpAddress;
    private String               hostName;
    private long                 timeStamp;
    private Map<String, Integer> metrics;
    private AtlasExportData      data;
    private OperationStatus      operationStatus;
    private String               sourceClusterName;
    private long                 lastModifiedTimestamp;

    public AtlasExportResult() {
        this(null, null, null, null, System.currentTimeMillis());
    }

    public AtlasExportResult(AtlasExportRequest request,
                             String userName, String clientIpAddress, String hostName, long timeStamp) {
        this.request         = request;
        this.userName        = userName;
        this.clientIpAddress = clientIpAddress;
        this.hostName        = hostName;
        this.timeStamp       = timeStamp;
        this.metrics         = new HashMap<>();
        this.operationStatus = OperationStatus.FAIL;
        this.data            = new AtlasExportData();
    }

    public AtlasExportRequest getRequest() {
        return request;
    }

    public void setRequest(AtlasExportRequest request) {
        this.request = request;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getClientIpAddress() {
        return clientIpAddress;
    }

    public void setClientIpAddress(String clientIpAddress) {
        this.clientIpAddress = clientIpAddress;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public long getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(long timeStamp) {
        this.timeStamp = timeStamp;
    }

    public Map<String, Integer> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Integer> metrics) {
        this.metrics = metrics;
    }

    public AtlasExportData getData() {
        return data;
    }

    public void setData(AtlasExportData data) {
        this.data = data;
    }

    public void setLastModifiedTimestamp(long lastModifiedTimestamp) {
        this.lastModifiedTimestamp = lastModifiedTimestamp;
    }

    public long getLastModifiedTimestamp() {
        return this.lastModifiedTimestamp;
    }

    public OperationStatus getOperationStatus() {
        return operationStatus;
    }

    public void setOperationStatus(OperationStatus operationStatus) {
        this.operationStatus = operationStatus;
    }

    public String getSourceClusterName() {
        return sourceClusterName;
    }

    public void setSourceClusterName(String sourceClusterName) {
        this.sourceClusterName = sourceClusterName;
    }

    public void incrementMeticsCounter(String key) {
        incrementMeticsCounter(key, 1);
    }

    public void incrementMeticsCounter(String key, int incrementBy) {
        int currentValue = metrics.containsKey(key) ? metrics.get(key) : 0;

        metrics.put(key, currentValue + incrementBy);
    }

    public AtlasExportResult shallowCopy() {
        AtlasExportResult result  = new AtlasExportResult();

        result.setRequest(getRequest());
        result.setUserName(getUserName());
        result.setClientIpAddress(getClientIpAddress());
        result.setHostName(getHostName());
        result.setTimeStamp(getTimeStamp());
        result.setMetrics(getMetrics());
        result.setOperationStatus(getOperationStatus());
        result.setSourceClusterName(getSourceClusterName());
        result.setLastModifiedTimestamp(getLastModifiedTimestamp());

        return result;
    }

    public StringBuilder toString(StringBuilder sb) {
        if (sb == null) {
            sb = new StringBuilder();
        }

        sb.append("AtlasExportResult{");
        sb.append("request={").append(request).append("}");
        sb.append(", userName='").append(userName).append("'");
        sb.append(", clientIpAddress='").append(clientIpAddress).append("'");
        sb.append(", hostName='").append(hostName).append("'");
        sb.append(", lastModifiedTimestamp='").append(lastModifiedTimestamp).append("'");
        sb.append(", sourceCluster='").append(sourceClusterName).append("'");
        sb.append(", timeStamp='").append(timeStamp).append("'");
        sb.append(", metrics={");
        AtlasBaseTypeDef.dumpObjects(metrics, sb);
        sb.append("}");

        sb.append(", data='").append(data).append("'");
        sb.append(", operationStatus='").append(operationStatus).append("'");
        sb.append("}");

        return sb;
    }

    @Override
    public String toString() {
        return toString(new StringBuilder()).toString();
    }

    public void clear() {
        if(this.data != null) {
            this.data.clear();
        }

        if(this.metrics != null) {
            this.metrics.clear();
        }
    }

    @JsonAutoDetect(getterVisibility=PUBLIC_ONLY, setterVisibility=PUBLIC_ONLY, fieldVisibility=NONE)
    @JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown=true)
    @XmlRootElement
    @XmlAccessorType(XmlAccessType.PROPERTY)
    public static class AtlasExportData implements Serializable{
        private static final long serialVersionUID = 1L;

        private AtlasTypesDef            typesDef;
        private Map<String, AtlasEntity> entities;
        private List<String>             entityCreationOrder;


        public AtlasExportData() {
            typesDef            = new AtlasTypesDef();
            entities            = new HashMap<>();
            entityCreationOrder = new ArrayList<>();
        }

        public AtlasTypesDef getTypesDef() { return typesDef; }

        public void setTypesDef(AtlasTypesDef typesDef) { this.typesDef = typesDef; }

        public Map<String, AtlasEntity> getEntities() { return entities; }

        public void setEntities(Map<String, AtlasEntity> entities) { this.entities = entities; }

        public List<String> getEntityCreationOrder() { return entityCreationOrder; }

        public void setEntityCreationOrder(List<String> entityCreationOrder) { this.entityCreationOrder = entityCreationOrder; }


        public StringBuilder toString(StringBuilder sb) {
            if (sb == null) {
                sb = new StringBuilder();
            }

            sb.append("AtlasExportData {");
            sb.append(", typesDef={").append(typesDef).append("}");
            sb.append(", entities={");
            AtlasBaseTypeDef.dumpObjects(entities, sb);
            sb.append("}");
            sb.append(", entityCreationOrder={");
            AtlasBaseTypeDef.dumpObjects(entityCreationOrder, sb);
            sb.append("}");
            sb.append("}");

            return sb;
        }

        @Override
        public String toString() {
            return toString(new StringBuilder()).toString();
        }

        public void clear() {
            if(this.typesDef!= null) {
                this.typesDef.clear();
            }

            if(this.entityCreationOrder != null) {
                this.entityCreationOrder.clear();
            }
        }
    }
}